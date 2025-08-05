
'use client';

import { cn } from "@/lib/utils";

type OrderStatusTimelineProps = {
    status: string;
    trackingCode?: string;
};

export default function OrderStatusTimeline({ status, trackingCode }: OrderStatusTimelineProps) {
    
    const statusSteps = ['Aprovado', 'A caminho', 'Entregue'];
    const statusLabels: { [key: string]: string } = {
        'Aprovado': 'Pagamento<br>confirmado',
        'A caminho': 'Pedido com a<br>transportadora',
        'Entregue': 'Pedido<br>entregue',
    };

    let currentStepIndex = statusSteps.indexOf(status);

    // If status is not in the main flow (e.g., 'Cancelado'), we handle it separately.
    if (status === 'Cancelado') {
        return (
            <div className="pedido-container-simplified">
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                    <h3 className="font-semibold text-destructive">Pedido Cancelado</h3>
                    <p className="text-sm text-destructive/80">Este pedido foi cancelado.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="pedido-container-simplified">
            <div className="pedido-status">
                {statusSteps.map((step, index) => {
                    const isCompleted = currentStepIndex > index;
                    const isActive = currentStepIndex === index;

                    return (
                        <>
                            <div key={step} className={cn("status-step", isCompleted && "completed", isActive && "active")}>
                                <span className="dot"></span>
                                <p dangerouslySetInnerHTML={{ __html: statusLabels[step] }} />
                                {step === 'A caminho' && trackingCode && (
                                     <a href={`https://www.melhorenvio.com.br/rastreio/${trackingCode}`} target="_blank" rel="noopener noreferrer" className="rastreio-link">
                                        Rastrear pedido
                                     </a>
                                )}
                            </div>
                            {index < statusSteps.length - 1 && (
                                <div className={cn("line", isCompleted && "completed", isActive && "active")}></div>
                            )}
                        </>
                    )
                })}
            </div>
        </div>
    );
}

