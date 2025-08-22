
'use client';

import Image from 'next/image';
import Link from 'next/link';

type Collection = {
  slug: string;
  name: string;
  image: string;
  hint: string;
};

type CollectionLinkProps = {
  collection: Collection;
};

export default function CollectionLink({ collection }: CollectionLinkProps) {
  return (
    <Link href={`/collection/${collection.slug}`} key={collection.name} className="flex flex-col items-center gap-2 group">
        <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105">
            <Image
                src={collection.image}
                alt={collection.name}
                data-ai-hint={collection.hint}
                fill
                quality={100}
                className="object-cover"
            />
        </div>
        <h3 className="font-semibold text-center text-sm md:text-base group-hover:text-primary">{collection.name}</h3>
    </Link>
  );
}
