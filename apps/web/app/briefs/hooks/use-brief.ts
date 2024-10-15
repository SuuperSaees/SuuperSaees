import { useMutation } from "@tanstack/react-query";
import { addFormFieldsToBriefs, createBrief } from "~/team-accounts/src/server/actions/briefs/create/create-briefs";
import { briefCreationFormSchema } from "../schemas/brief-creation-schema";
import { Dispatch, SetStateAction, useState } from "react";
import { Brief } from "~/lib/brief.types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FormField } from "../types/brief.types";
import { z } from "zod";

export const useBrief = (setFormFields: Dispatch<SetStateAction<FormField[]>>) => {

  const router = useRouter();
  
  const defaultBrief = {
    name: '',
    description: '',
  }
  const [brief, setBrief] = useState<Brief.Insert>(defaultBrief);

  function updateBrief(updatedBrief: Brief.Insert) {
    setBrief(updatedBrief);
  }

  // Mutation to handle brief creation
  const briefMutation = useMutation({
    mutationFn: async (values: z.infer<typeof briefCreationFormSchema>) => {
      // Create a new brief with the provided values
      const briefId = await createBrief({
        name: values.name,
        description: values.description,
        image_url: values.image_url,
      });

      // If brief creation was successful, add associated form fields
      if (briefId?.id) {
        await addFormFieldsToBriefs(values.questions, briefId.id);
      } else {
        throw new Error('Failed to retrieve briefId'); // Error handling for brief creation failure
      }
    },
    onError: () => {
      // Show error toast notification on mutation failure
      toast('Error', { description: 'There was an error creating the brief.' });
    },
    onSuccess: () => {
      // Show success toast notification and redirect on successful brief creation
      toast('Success', { description: 'The brief has been created.' });
      router.push('/briefs'); // Redirect to briefs page
      // reset
      setBrief(defaultBrief)
      setFormFields([]);
    },
  });

  return {
    brief,
    briefMutation,
    setBrief,
    updateBrief,
  }
}