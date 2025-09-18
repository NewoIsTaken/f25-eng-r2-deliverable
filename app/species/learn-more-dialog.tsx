"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Comment from "./comment";

type Species = Database["public"]["Tables"]["species"]["Row"];

const commentSchema = z.object({
  comment_body: z
    .string()
    .trim()
    .min(1)
    .transform((val) => val?.trim()),
});

type FormData = z.infer<typeof commentSchema>;

const defaultValues: Partial<FormData> = {
  comment_body: "",
};

export default function LearnMoreDialog({ userId, species, user }: { userId: string; species: Species; user: string }) {
  const comments = species.comment_list!;

  const router = useRouter();
  // Control open/closed state of the dialog
  const [open, setOpen] = useState<boolean>(false);

  const form = useForm<FormData>({
    resolver: zodResolver(commentSchema),
    defaultValues,
    mode: "onChange",
  });
  const supabase = createBrowserSupabaseClient();

  // async function getDisplayName (user: string) {
  //   const { data, error } = await supabase
  //     .from("profiles")
  //     .select("display_name")
  //     .eq("id", user);

  //   // Catch and report errors from Supabase and exit the onSubmit function with an early 'return' if an error occurred.
  //   if (error) {
  //     return toast({
  //       title: "Something went wrong.",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   }

  //   return data[0]?.display_name;
  // }

  async function deleteComment(index: number) {
    if (Array.isArray(comments)) {
      comments.splice(index, 1);
    } else {
      throw "Expected comments to be an array!";
    }

    const { error } = await supabase
      .from("species")
      .update({
        author: userId,
        common_name: species.common_name,
        description: species.description,
        kingdom: species.kingdom,
        scientific_name: species.scientific_name,
        total_population: species.total_population,
        image: species.image,
        comment_list: comments,
      })
      .eq("id", species.id);

    // Catch and report errors from Supabase and exit the onSubmit function with an early 'return' if an error occurred.
    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    router.refresh();
    return toast({
      title: "Comment deleted!",
      description: "Successfully deleted your comment.",
    });
  }

  const onSubmit = async (input: FormData) => {
    if (Array.isArray(comments)) {
      comments.unshift({
        author: userId,
        user: user,
        timestamp: Date.now(),
        comment_body: input.comment_body,
      });
    } else {
      throw "Expected comments to be an array!";
    }
    // The `input` prop contains data that has already been processed by zod. We can now use it in a supabase query
    const { error } = await supabase
      .from("species")
      .update({
        author: userId,
        common_name: species.common_name,
        description: species.description,
        kingdom: species.kingdom,
        scientific_name: species.scientific_name,
        total_population: species.total_population,
        image: species.image,
        comment_list: comments,
      })
      .eq("id", species.id);

    // Catch and report errors from Supabase and exit the onSubmit function with an early 'return' if an error occurred.
    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    // Because Supabase errors were caught above, the remainder of the function will only execute upon a successful edit

    // Reset form values to the default (empty) values.
    // Practically, this line can be removed because router.refresh() also resets the form. However, we left it as a reminder that you should generally consider form "cleanup" after an add/edit operation.
    form.reset(defaultValues);

    // Refresh all server components in the current route. This helps display the newly created species because species are fetched in a server component, species/page.tsx.
    // Refreshing that server component will display the new species from Supabase
    router.refresh();

    return toast({
      title: "New comment added!",
      description: "Successfully added your comment.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">Learn More</Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{species.scientific_name}</DialogTitle>
          <DialogDescription>{species.common_name}</DialogDescription>
        </DialogHeader>
        <p>Kingdom: {species.kingdom}</p>
        <p>Total Population: {species.total_population}</p>
        <p>Description: {species.description}</p>
        <h3>Comments</h3>
        <Form {...form}>
          <form onSubmit={(e: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(e)}>
            <div className="flex w-full items-center gap-4">
              <FormField
                control={form.control}
                name="comment_body"
                render={({ field }) => {
                  // We must extract value from field and convert a potential defaultValue of `null` to "" because textareas can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                  const { value, ...rest } = field;
                  return (
                    <FormItem className="w-full">
                      <FormLabel>Add Comment</FormLabel>
                      <FormControl>
                        <Textarea value={value ?? ""} {...rest} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <div className="mt-auto flex">
                <Button type="submit" className="ml-1 mr-1 flex-auto">
                  +
                </Button>
              </div>
            </div>
          </form>
        </Form>

        <div>
          {comments.map((comment, index) => (
            <div key={index} className="mt-2 flex">
              <Comment key={index} comment={comment}></Comment>
              {comment.author == userId && (
                <Button key={index} className="ml-1 mr-1" onClick={() => deleteComment(index)}>
                  Delete
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
