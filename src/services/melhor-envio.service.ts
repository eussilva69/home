
import type { CartItemType } from "@/hooks/use-cart";

const MELHOR_ENVIO_API_URL = 'https://www.melhorenvio.com.br/api/v2';
// Este token é sensível e deve ser armazenado de forma segura em variáveis de ambiente
const MELHOR_ENVIO_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOWRhMzU4NTVkYjBjNTg0Mzc5OGZjNjg5NTdjMmFjYzExOWVlYWEzYmM2YmY0MmY3OTU0NDA3ZmZlY2VlZmYzOWE1YTdhZDZjYjhlMjE0NTgiLCJpYXQiOjE3NTQwODM1MTQuMTI3OTMsIm5iZiI6MTc1NDA4MzUxNC4xMjc5MzIsImV4cCI6MTc4NTYxOTUxNC4xMTU1MSwic3ViIjoiOWY4N2ZiOWYtNzI3Zi00ZDhiLWIyNjItMDEwNjk4ZWY5NjNkIiwic2NvcGVzIjpbImNhcnQtcmVhZCIsImNhcnQtd3JpdGUiLCJjb21wYW5pZXMtcmVhZCIsImNvbXBhbmllcy13cml0ZSIsImNvdXBvbnMtcmVhZCIsImNvdXBvbnMtd3JpdGUiLCJub3RpZmljYXRpb25zLXJlYWQiLCJvcmRlcnMtcmVhZCIsInByb2R1Y3RzLXJlYWQiLCJwcm9kdWN0cy1kZXN0cm95IiwicHJvZHVjdHMtd3JpdGUiLCJwdXJjaGFzZXMtcmVhZCIsInNoaXBwaW5nLWNhbGN1bGF0ZSIsInNoaXBwaW5nLWNhbmNlbCIsInNoaXBwaW5nLWNoZWNrb3V0Iiwic2hpcHBpbmctY29tcGFuaWVzIiwic2hpcHBpbmctZ2VuZXJhdGUiLCJzaGlwcGluZy1wcmV2aWV3Iiwic2hpcHBpbmctcHJpbnQiLCJzaGlwcGluZy1zaGFyZSIsInNoaXBwaW5nLXRyYWNraW5nIiwiZWNvbW1lcmNlLXNoaXBwaW5nIiwidHJhbnNhY3Rpb25zLXJlYWQiLCJ1c2Vycy1yZWFkIiwidXNlcnMtd3JpdGUiLCJ3ZWJob29rcy1yZWFkIiwid2ViaG9va3Mtd3JpdGUiLCJ3ZWJob29rcy1kZWxldGUiLCJ0ZGVhbGVyLXdlYmhvb2siXX0.ohzUtGvu_RUySL4C1y6nZMrQLFwG3vfbohPSzIOphJQB1z3qAvHNOQDMrn4LlTa12V49U3UD052AKkqdlz2gnRdyvpR2pqiR4xFarmD_L9c8itSwh42eiLHxtECcCJ5rsRjewAwBmkt3zv6InLfrV1y33mc0KJXM7N2ycFHpBX2cuJ4y6m27sb8Ty35zdKsBExbw9uik1C0HD-4PchCmwHZlEvE4zBh1QxK2esZtMvrYS8HkpYWeKw19zOpQ4s7XBWi_wWNK0mBiLygwSyUC6CHap8a3niTaC3nb1D-NjGQOcF7lj8H9zxcs0p_zNrPQegIYqPWXv1Bl8bozuTyJEqIkF0G4hj8YPZRUQigzo504Ldp6rXkEvRFZEnxVRooQNLvf50btRJLx30WS6VPZVCwTfBBEKvPsYoAKM5b9lVJOrdgwHpIJdHqxpt-yFc2FZz4vGkZB0KqV-KzpDqqUo7BKlZZqtFkiFMR0tL10RHD7DDRqfdSjvs7peA2LtmmstrVb2tK5iH1L24mXzOUzF-DpVY2NqBKDw9zvNpwEjnRRi2K6datGY-RRA2kBLWoDC8bGeayoPni6oVGE9XqT9sX-Wv4_WgnUQCxoPvSuSx7NYTrYvkJiJI-4nTezObTV1kTixtaJBjxdfU-1q6A6SdZeE0Bg2a5UZWJyWeZnurE";

const ORIGIN_POSTAL_CODE = "38401-104";

class MelhorEnvioService {
  private headers: HeadersInit;

  constructor(token: string) {
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Home Designer (homedecorinterioresplanejados@gmail.com)'
    };
  }

  async calculateShipping(toPostalCode: string, products: CartItemType[]): Promise<any> {
    const url = `${MELHOR_ENVIO_API_URL}/me/shipment/calculate`;
    
    if (products.length === 0) {
        throw new Error("O carrinho está vazio.");
    }

    const body = {
      from: {
        postal_code: ORIGIN_POSTAL_CODE,
      },
      to: {
        postal_code: toPostalCode.replace(/\D/g, ''),
      },
      products: products.map(p => ({
        id: p.id,
        width: p.width,
        height: p.height,
        length: p.length,
        weight: p.weight,
        insurance_value: p.price,
        quantity: p.quantity,
      })),
      options: {
        receipt: false,
        own_hand: false,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Melhor Envio pode retornar erros em um array `errors`
        if (data.errors) {
            const errorMessages = Object.values(data.errors).flat().join(' ');
            throw new Error(errorMessages || 'Erro da API do Melhor Envio.');
        }
        throw new Error(data.message || 'Não foi possível calcular o frete.');
      }
      
      // Filtra para não incluir opções com erro
      return data.filter((option: any) => !option.error);

    } catch (error) {
      console.error('Erro na chamada para Melhor Envio:', error);
      throw error;
    }
  }
}

export const melhorEnvioService = new MelhorEnvioService(MELHOR_ENVIO_TOKEN);
