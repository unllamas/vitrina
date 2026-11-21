import { type MouseEvent, useEffect, useRef, useState } from "react";

import type { BrandKit, BusinessProfile, InstagramPost } from "@/types.ts";

import { BrandPoster, posterLine } from "./brand-poster.tsx";
import { brandRoles, readableInk } from "./brand-style.ts";

export function PostGrid({ posts, business, brand }: { posts: InstagramPost[]; business: BusinessProfile; brand: BrandKit }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = posts.find((post) => post.id === openId) ?? null;
  const openIndex = posts.findIndex((post) => post.id === openId);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>("[data-close]")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <>
      <ol className="grid max-w-xl grid-cols-3 gap-1 sm:gap-1.5">
        {posts.map((post, index) => (
          <li key={post.id}>
            <button
              type="button"
              className="block w-full rounded-md"
              onClick={() => setOpenId(post.id)}
              aria-haspopup="dialog"
              aria-label={`Ver el posteo ${index + 1}: ${post.caption}`}
            >
              <div className="aspect-square overflow-hidden rounded-md">
                <BrandPoster brand={brand} index={index} headline={posterLine(post.caption)} />
              </div>
            </button>
          </li>
        ))}
      </ol>
      <dialog
        ref={dialogRef}
        className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(26rem,calc(100%-1.5rem))] overflow-auto rounded-3xl border-0 bg-surface p-0 text-ink"
        aria-labelledby="post-dialog-title"
        onClose={() => setOpenId(null)}
        onClick={(event) => {
          if (clickedBackdrop(event)) event.currentTarget.close();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") event.currentTarget.close();
        }}
      >
        {open ? (
          <PostDetail post={open} index={openIndex} business={business} brand={brand} onClose={() => dialogRef.current?.close()} />
        ) : null}
      </dialog>
    </>
  );
}

function clickedBackdrop(event: MouseEvent<HTMLDialogElement>): boolean {
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
}

function PostDetail({
  post,
  index,
  business,
  brand,
  onClose,
}: {
  post: InstagramPost;
  index: number;
  business: BusinessProfile;
  brand: BrandKit;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-3 py-2">
        <Avatar brand={brand} />
        <div className="min-w-0 flex-1">
          <p id="post-dialog-title" className="truncate text-sm font-medium">
            {business.name}
          </p>
          <p className="truncate text-xs text-muted">{business.category}</p>
        </div>
        <button
          type="button"
          data-close
          className="inline-flex size-11 items-center justify-center rounded-full"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="aspect-square w-full">
        <BrandPoster brand={brand} index={index < 0 ? 0 : index} headline={posterLine(post.caption)} kicker={post.visual} />
      </div>
      <div className="flex min-h-11 items-center gap-4 px-4 text-ink" aria-hidden="true">
        <HeartIcon />
        <CommentIcon />
        <SendIcon />
      </div>
      <p className="px-4 text-sm leading-relaxed text-pretty">
        <span className="font-medium">{business.name}</span> {post.caption}
      </p>
      <p className="px-4 pt-2 pb-5 text-xs leading-relaxed text-muted">Pieza: {post.visual}</p>
    </div>
  );
}

function Avatar({ brand }: { brand: BrandKit }) {
  const roles = brandRoles(brand);
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-medium"
      style={{ background: roles.ink, color: readableInk(roles.ink) }}
    >
      {brand.logo.initials}
    </span>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <path
        d="M12 19s-7-4.4-7-8.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 14.6 12 19 12 19z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <path d="M6 16.5 4 20l4-1.5A8 8 0 1 0 6 16.5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <path d="M4 12 20 5l-6 15-2.5-6.5L4 12z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
