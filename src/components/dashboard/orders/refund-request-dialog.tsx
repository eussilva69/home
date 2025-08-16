
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requestRefund } from '@/app/actions';
import { refundRequestSchema } from '@/lib/schemas';

type RefundRequestDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string;
    customerEmail: string;
    customerName: string;
    onSuccess: () => void;
};

type RefundFormValues = z.infer<typeof refundRequestSchema>;

async function uploadImages(files: FileList): Promise<string[]> {
    const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`/api/upload-image`, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        if (data.success) {
            return data.url;
        }
        throw new Error(data.details || "Falha no upload da imagem.");
    });
    return Promise.all(uploadPromises);
}

export default function RefundRequestDialog({ isOpen, onOpenChange, orderId, customerEmail, customerName, onSuccess }: RefundRequestDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<RefundFormValues>({
        resolver: zodResolver(refundRequestSchema),
        defaultValues: {
            orderId: orderId,
            reason: '',
            photos: undefined,
        },
    });

    const onSubmit = async (data: RefundFormValues) => {
        setIsSubmitting(true);
        try {
            let photoUrls: string[] = [];
            if (data.photos && data.photos.length > 0) {
                photoUrls = await uploadImages(data.photos);
            }
            
            const result = await requestRefund({
                orderId,
                customerEmail,
                customerName,
                reason: data.reason,
                photoUrls,
            });

            if (result.success) {
                toast({ title: 'Sucesso!', description: result.message });
                onSuccess();
                onOpenChange(false);
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
            toast({ variant: 'destructive', title: 'Erro ao solicitar devolução', description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Solicitar Devolução</DialogTitle>
                    <DialogDescription>
                        Pedido #{orderId.slice(0, 8)}. Por favor, descreva o motivo da sua solicitação. Se for um defeito, anexe fotos.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Motivo da Devolução</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Ex: O produto chegou com um defeito na moldura." {...field} rows={5} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="photos"
                            render={({ field: { onChange, ...fieldProps } }) => (
                                <FormItem>
                                    <FormLabel>Anexar Fotos (Opcional)</FormLabel>
                                    <FormControl>
                                        <div className="relative flex items-center justify-center w-full">
                                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                                                    <p className="text-xs text-muted-foreground">PNG, JPG ou GIF</p>
                                                </div>
                                                <Input
                                                    {...fieldProps}
                                                    id="dropzone-file"
                                                    type="file"
                                                    className="hidden"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => onChange(e.target.files)}
                                                />
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Enviar Solicitação
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
