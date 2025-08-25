
'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AddressSchema, type Address } from '@/lib/schemas';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

type AddressFormDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (address: Address) => Promise<void>;
    addressToEdit?: Address | null;
};

type AddressFormValues = z.infer<typeof AddressSchema>;

export default function AddressFormDialog({ isOpen, onOpenChange, onSave, addressToEdit }: AddressFormDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(AddressSchema),
        defaultValues: {
            id: undefined,
            nickname: '',
            cep: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            isDefault: false,
        }
    });

    useEffect(() => {
        if (addressToEdit) {
            form.reset(addressToEdit);
        } else {
            form.reset({
                id: undefined, nickname: '', cep: '', street: '', number: '',
                complement: '', neighborhood: '', city: '', state: '', isDefault: false,
            });
        }
    }, [addressToEdit, form]);

    const cepValue = form.watch('cep');

    useEffect(() => {
        const fetchAddress = async () => {
            const cleanCep = cepValue?.replace(/\D/g, '');
            if (cleanCep?.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                    const data = await response.json();
                    if (!data.erro) {
                        form.setValue('street', data.logradouro);
                        form.setValue('neighborhood', data.bairro);
                        form.setValue('city', data.localidade);
                        form.setValue('state', data.uf);
                    }
                } catch (error) {
                    toast({ title: "Erro ao buscar CEP", variant: "destructive" });
                }
            }
        };
        fetchAddress();
    }, [cepValue, form, toast]);

    const onSubmit = async (data: AddressFormValues) => {
        setIsSubmitting(true);
        await onSave(data);
        setIsSubmitting(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{addressToEdit ? 'Editar Endereço' : 'Adicionar Novo Endereço'}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-grow pr-6 -mr-6">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="nickname" render={({ field }) => (
                                <FormItem><FormLabel>Apelido (ex: Casa, Trabalho)</FormLabel><FormControl><Input placeholder="Apelido do endereço" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />

                            <FormField control={form.control} name="cep" render={({ field }) => (
                                <FormItem><FormLabel>CEP</FormLabel><FormControl><Input placeholder="00000-000" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />

                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name="street" render={({ field }) => (
                                    <FormItem className="col-span-2"><FormLabel>Rua</FormLabel><FormControl><Input placeholder="Nome da rua" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="number" render={({ field }) => (
                                    <FormItem><FormLabel>Número</FormLabel><FormControl><Input placeholder="Nº" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            
                            <FormField control={form.control} name="complement" render={({ field }) => (
                                <FormItem><FormLabel>Complemento (Opcional)</FormLabel><FormControl><Input placeholder="Apto, bloco, etc." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="neighborhood" render={({ field }) => (
                                    <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input placeholder="Seu bairro" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem ><FormLabel>Cidade</FormLabel><FormControl><Input placeholder="Sua cidade" {...field} readOnly /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="state" render={({ field }) => (
                                    <FormItem><FormLabel>UF</FormLabel><FormControl><Input placeholder="UF" {...field} readOnly /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="isDefault" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none">
                                    <FormLabel>Tornar este o endereço padrão</FormLabel>
                                    </div>
                                </FormItem>
                            )} />
                            {/* The footer will be outside the scrollable area */}
                        </form>
                    </FormProvider>
                </ScrollArea>
                <DialogFooter className="pt-4 border-t">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Endereço
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
