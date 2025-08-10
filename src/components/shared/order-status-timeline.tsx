
'use client';

import React from 'react';
import { cn } from "@/lib/utils";

type OrderStatusTimelineProps = {
    status: string;
    trackingCode?: string;
    shippingDetails?: any;
};

export default function OrderStatusTimeline({ status, trackingCode, shippingDetails }: OrderStatusTimelineProps) {
    
    const statusSteps = ['Aprovado', 'Em separação', 'A caminho', 'Entregue'];
    const statusLabels: { [key: string]: string } = {
        'Aprovado': 'Pagamento<br>confirmado',
        'Em separação': 'Em<br>separação',
        'A caminho': 'Pedido com a<br>transportadora',
        'Entregue': 'Pedido<br>entregue',
    };

    let currentStepIndex = statusSteps.indexOf(status);

    if (status === 'Cancelado' || status === 'Devolução Solicitada') {
        const title = status === 'Cancelado' ? 'Pedido Cancelado' : 'Devolução Solicitada';
        const description = status === 'Cancelado' ? 'Este pedido foi cancelado.' : 'Sua solicitação de devolução está em análise.';
        return (
            <div className="pedido-container-simplified">
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                    <h3 className="font-semibold text-destructive">{title}</h3>
                    <p className="text-sm text-destructive/80">{description}</p>
                </div>
            </div>
        )
    }

    const getTrackingUrl = () => {
        if (!trackingCode) return '#';
        if (!shippingDetails?.company) return `https://www.melhorenvio.com.br/rastreio/${trackingCode}`;
        
        const companyName = shippingDetails.company.toLowerCase();
        if (companyName.includes('jadlog')) {
            return `https://www.jadlog.com.br/jadlog/captcha?tipo=tracking&valor=${trackingCode}`;
        }
        if (companyName.includes('correios')) {
            return `https://rastreamento.correios.com.br/app/index.php?objetos=${trackingCode}`;
        }
        // Fallback para o link genérico do Melhor Envio
        return `https://www.melhorenvio.com.br/rastreio/${trackingCode}`;
    }

    return (
        <div className="pedido-container-simplified">
            <div className="pedido-status">
                {statusSteps.map((step, index) => {
                    const isCompleted = currentStepIndex >= index;
                    const isActive = currentStepIndex === index;

                    return (
                        <React.Fragment key={step}>
                            <div className={cn("status-step", isCompleted && "completed", isActive && "active")}>
                                <span className="dot"></span>
                                <p dangerouslySetInnerHTML={{ __html: statusLabels[step] }} />
                                {step === 'A caminho' && trackingCode && (
                                     <a href={getTrackingUrl()} target="_blank" rel="noopener noreferrer" className="rastreio-link">
                                        Rastrear pedido
                                     </a>
                                )}
                            </div>
                            {index < statusSteps.length - 1 && (
                                <div className={cn("line", isCompleted && "completed")}></div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    );
}
