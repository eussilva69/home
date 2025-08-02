
'use client';

import { Address } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, CheckCircle } from "lucide-react";

type AddressCardProps = {
    address: Address;
    onEdit: (address: Address) => void;
    onDelete: (addressId: string) => void;
    onSetDefault: (addressId: string) => void;
};

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
    return (
        <Card className="w-full">
            <CardContent className="p-4 flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{address.nickname}</h3>
                        {address.isDefault && <Badge variant="default">Padrão</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {address.street}, {address.number} - {address.neighborhood}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} - {address.cep}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    {!address.isDefault && (
                        <Button variant="ghost" size="icon" onClick={() => onSetDefault(address.id!)} title="Definir como padrão">
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                    )}
                     <Button variant="ghost" size="icon" onClick={() => onEdit(address)} title="Editar">
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(address.id!)} title="Excluir">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
