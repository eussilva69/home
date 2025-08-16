import { v2 as cloudinary } from 'cloudinary';

// ATENÇÃO: Essas chaves são sensíveis e não devem ser expostas no lado do cliente.
// Elas são usadas apenas no servidor (em Server Actions ou API routes).
cloudinary.config({
  cloud_name: 'dl38o4mnk',
  api_key: '985145697383117',
  api_secret: '2P4uB-Zt36NqajhBgFvvoKJNaIY',
  secure: true,
});

export default cloudinary;
