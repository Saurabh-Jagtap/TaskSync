
"use client";

import { useEffect } from "react";
import { LoaderCircle, MessageSquarePlus, Check } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormValues {
    content: string;
}

interface CommentFormProps {
    onSubmit: (content: string) => Promise<void>;
    isSubmitting: boolean;
    defaultValue?: string;
    placeholder?: string;
    submitLabel?: string;
    onCancel?: () => void;
}

const CommentForm = ({
    onSubmit,
    isSubmitting,
    defaultValue = "",
    placeholder = "Write a comment...",
    submitLabel = "Add comment",
    onCancel,
}: CommentFormProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CommentFormValues>({
        defaultValues: { content: defaultValue },
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    useEffect(() => {
        reset({ content: defaultValue });
    }, [defaultValue, reset]);

    const isEditMode = Boolean(onCancel);

    const handleFormSubmit: SubmitHandler<CommentFormValues> = async ({
        content,
    }) => {
        await onSubmit(content.trim());

        if (!isEditMode) {
            reset({ content: "" });
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-2">
            <Textarea
                placeholder={placeholder}
                rows={isEditMode ? 3 : 2}
                aria-invalid={Boolean(errors.content)}
                maxLength={255}
                disabled={isSubmitting}
                className="resize-y border-border/90 bg-background shadow-none placeholder:text-muted-foreground/80 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
                {...register("content", {
                    required: "Comment cannot be empty",
                    maxLength: {
                        value: 255,
                        message: "Comment cannot exceed 255 characters",
                    },
                    validate: (value) =>
                        value.trim().length > 0 ||
                        "Comment cannot be empty",
                })}
            />

            {errors.content && (
                <p className="text-sm text-destructive" role="alert">
                    {errors.content.message}
                </p>
            )}

            <div className="flex items-center justify-end gap-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={onCancel}
                        className="h-8 rounded-lg text-xs"
                    >
                        Cancel
                    </Button>
                )}

                <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="h-8 rounded-lg bg-emerald-700 px-3 text-xs font-medium text-white hover:bg-emerald-800 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300"
                >
                    {isSubmitting ? (
                        <LoaderCircle className="mr-1.5 size-3.5 animate-spin" />
                    ) : isEditMode ? (
                        <Check className="mr-1.5 size-3.5" />
                    ) : (
                        <MessageSquarePlus className="mr-1.5 size-3.5" />
                    )}

                    {isSubmitting
                        ? isEditMode
                            ? "Saving..."
                            : "Adding..."
                        : submitLabel}
                </Button>
            </div>
        </form>
    );
};

export default CommentForm;
