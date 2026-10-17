"use client";

import * as React from "react";
import { Pause, Play, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import styles from "./testimonials.module.css";

export type TestimonialCard = {
  id: string;
  clientName: string;
  clientRole: string | null;
  content: string;
  rating: number;
  avatar: string | null;
};

function TestimonialSlide({
  testimonial,
  index,
  total,
}: {
  testimonial: TestimonialCard;
  index: number;
  total: number;
}) {
  return (
    <div
      className={styles.slide}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} dari ${total}`}
    >
      <article className={styles.quoteCard}>
        <div className={styles.cardHeading}>
          <div
            className={styles.rating}
            role="img"
            aria-label={`${testimonial.rating} dari 5 bintang`}
          >
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <Star
                key={starIndex}
                className={
                  starIndex < testimonial.rating
                    ? styles.starActive
                    : styles.starInactive
                }
                aria-hidden="true"
              />
            ))}
          </div>
          <span className={styles.cardIndex} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <Quote className={styles.quoteMark} aria-hidden="true" />
        <blockquote className={styles.quoteText}>
          &ldquo;{testimonial.content}&rdquo;
        </blockquote>
        <footer className={styles.author}>
          <Avatar className={styles.avatar}>
            {testimonial.avatar ? (
              <AvatarImage
                src={testimonial.avatar}
                alt={testimonial.clientName}
              />
            ) : null}
            <AvatarFallback className={styles.avatarFallback}>
              {getInitials(testimonial.clientName)}
            </AvatarFallback>
          </Avatar>
          <div className={styles.authorCopy}>
            <div className={styles.authorName}>{testimonial.clientName}</div>
            {testimonial.clientRole && (
              <div className={styles.authorRole}>{testimonial.clientRole}</div>
            )}
          </div>
          <span className={styles.authorAccent} aria-hidden="true" />
        </footer>
      </article>
    </div>
  );
}

export function TestimonialsCarousel({ items }: { items: TestimonialCard[] }) {
  const [isPlaying, setIsPlaying] = React.useState(true);

  if (!items.length) return null;

  const hasMultipleItems = items.length > 1;
  const trackClassName = [
    styles.track,
    !isPlaying || !hasMultipleItems ? styles.isPaused : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimoni klien Aldera Tech"
    >
      <div className={styles.viewport}>
        <div
          className={trackClassName}
          style={{ animationDuration: `${Math.max(24, items.length * 8)}s` }}
          aria-live="off"
        >
          <div className={styles.group}>
            {items.map((testimonial, index) => (
              <TestimonialSlide
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
                total={items.length}
              />
            ))}
          </div>
          {hasMultipleItems && (
            <div className={styles.group} aria-hidden="true">
              {items.map((testimonial, index) => (
                <TestimonialSlide
                  key={`${testimonial.id}-duplicate`}
                  testimonial={testimonial}
                  index={index}
                  total={items.length}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {hasMultipleItems && (
        <div className={styles.controls}>
          <span className={styles.motionNote}>Cerita mitra Aldera Tech</span>
          <Button
            variant="outline"
            size="icon"
            className={styles.controlButton}
            onClick={() => setIsPlaying((playing) => !playing)}
            aria-label={
              isPlaying
                ? "Jeda guliran testimoni"
                : "Lanjutkan guliran testimoni"
            }
            aria-pressed={isPlaying}
          >
            {isPlaying ? (
              <Pause className="size-4" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
