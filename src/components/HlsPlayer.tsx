"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCcw, Maximize2, Minimize2 } from "lucide-react";
import { selectError } from '@videojs/core/dom';
import { type ComponentProps, forwardRef, type ReactNode, useRef, type PropsWithChildren, type CSSProperties } from 'react';

import { AlertDialog, Container, usePlayer, BufferingIndicator, CaptionsButton, Controls, FullscreenButton, MuteButton, PiPButton, PlayButton, PlaybackRateButton, Popover, SeekButton, Time, TimeSlider, Tooltip, VolumeSlider } from '@videojs/react';
import { createPlayer } from "@videojs/react";
import { Video, videoFeatures } from "@videojs/react/video";
import HlsVideo from "@videojs/react/media/hls-video";

const Player = createPlayer({ features: videoFeatures });

export interface ErrorDialogClasses {
  root?: string;
  dialog?: string;
  content?: string;
  title?: string;
  description?: string;
  actions?: string;
  close?: string;
}

export function ErrorDialog({ classes }: { classes?: ErrorDialogClasses }): ReactNode {
  const errorState = usePlayer(selectError);
  const lastError = useRef(errorState?.error);
  if (errorState?.error) lastError.current = errorState.error;

  if (!errorState) return null;

  return (
    <AlertDialog.Root
      open={!!errorState.error}
      onOpenChange={(open) => {
        if (!open) errorState.dismissError();
      }}
    >
      <AlertDialog.Popup className={classes?.root}>
        <div className={classes?.dialog}>
          <div className={classes?.content}>
            <AlertDialog.Title className={classes?.title}>Something went wrong.</AlertDialog.Title>
            <AlertDialog.Description className={classes?.description}>
              {lastError.current?.message ?? 'An error occurred while trying to play the video. Please try again.'}
            </AlertDialog.Description>
          </div>
          <div className={classes?.actions}>
            <AlertDialog.Close className={classes?.close}>OK</AlertDialog.Close>
          </div>
        </div>
      </AlertDialog.Popup>
    </AlertDialog.Root>
  );
}

const SEEK_TIME = 10;

export type VideoSkinProps = PropsWithChildren<{ style?: CSSProperties; className?: string }>;

const Button = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(function Button({ className, ...props }, ref) {
  return <button ref={ref} type="button" className={['media-button', className].filter(Boolean).join(' ')} {...props} />;
});

const errorClasses = {
  root: 'media-error',
  dialog: 'media-error__dialog media-surface',
  content: 'media-error__content',
  title: 'media-error__title',
  description: 'media-error__description',
  actions: 'media-error__actions',
  close: 'media-button',
};

function PlayLabel(): ReactNode {
  const paused = usePlayer((s) => Boolean(s.paused));
  const ended = usePlayer((s) => Boolean(s.ended));
  if (ended) return <>Replay</>;
  return paused ? <>Play</> : <>Pause</>;
}

function CaptionsLabel(): ReactNode {
  const active = usePlayer((s) => Boolean(s.subtitlesShowing));
  return active ? <>Disable captions</> : <>Enable captions</>;
}

function PiPLabel(): ReactNode {
  const pip = usePlayer((s) => Boolean(s.pip));
  return pip ? <>Exit picture-in-picture</> : <>Enter picture-in-picture</>;
}

function FullscreenLabel(): ReactNode {
  const fullscreen = usePlayer((s) => Boolean(s.fullscreen));
  return fullscreen ? <>Exit fullscreen</> : <>Enter fullscreen</>;
}

export function VideoSkin(props: VideoSkinProps): ReactNode {
  const { children, className, ...rest } = props;

  return (
    <Container className={['media-default-skin media-default-skin--video', className].filter(Boolean).join(' ')} {...rest}>
      {children}

      <BufferingIndicator
        render={(props) => (
          <div {...props} className="media-buffering-indicator">
            <div className="media-surface">
              <svg className="media-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><rect width="2" height="5" x="8" y=".5" opacity=".5" rx="1"><animate attributeName="opacity" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="2" height="5" x="12.243" y="2.257" opacity=".45" rx="1" transform="rotate(45 13.243 4.757)"><animate attributeName="opacity" begin="0.125s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x="12.5" y="8" opacity=".4" rx="1"><animate attributeName="opacity" begin="0.25s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x="10.743" y="12.243" opacity=".35" rx="1" transform="rotate(45 13.243 13.243)"><animate attributeName="opacity" begin="0.375s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="2" height="5" x="8" y="12.5" opacity=".3" rx="1"><animate attributeName="opacity" begin="0.5s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="2" height="5" x="3.757" y="10.743" opacity=".25" rx="1" transform="rotate(45 4.757 13.243)"><animate attributeName="opacity" begin="0.625s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x=".5" y="8" opacity=".15" rx="1"><animate attributeName="opacity" begin="0.75s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x="2.257" y="3.757" opacity=".1" rx="1" transform="rotate(45 4.757 4.757)"><animate attributeName="opacity" begin="0.875s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect></svg>
            </div>
          </div>
        )}
      />

      <ErrorDialog classes={errorClasses} />

      <Controls.Root className="media-surface media-controls">
        <Tooltip.Provider>
          <Tooltip.Root side="top">
            <Tooltip.Trigger
              render={
                <PlayButton
                  render={(props) => (
                    <Button {...props} className="media-button--icon media-button--play">
                      <svg className="media-icon media-icon--restart" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M9 17a8 8 0 0 1-8-8h2a6 6 0 1 0 1.287-3.713l1.286 1.286A.25.25 0 0 1 5.396 7H1.25A.25.25 0 0 1 1 6.75V2.604a.25.25 0 0 1 .427-.177l1.438 1.438A8 8 0 1 1 9 17"/><path fill="currentColor" d="m11.61 9.639-3.331 2.07a.826.826 0 0 1-1.15-.266.86.86 0 0 1-.129-.452V6.849C7 6.38 7.374 6 7.834 6c.158 0 .312.045.445.13l3.331 2.071a.858.858 0 0 1 0 1.438"/></svg>
                      <svg className="media-icon media-icon--play" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="m14.051 10.723-7.985 4.964a1.98 1.98 0 0 1-2.758-.638A2.06 2.06 0 0 1 3 13.964V4.036C3 2.91 3.895 2 5 2c.377 0 .747.109 1.066.313l7.985 4.964a2.057 2.057 0 0 1 .627 2.808c-.16.257-.373.475-.627.637"/></svg>
                      <svg className="media-icon media-icon--pause" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><rect width="5" height="14" x="2" y="2" fill="currentColor" rx="1.75"/><rect width="5" height="14" x="11" y="2" fill="currentColor" rx="1.75"/></svg>
                    </Button>
                  )}
                />
              }
            />
            <Tooltip.Popup className="media-surface media-tooltip">
              <PlayLabel />
            </Tooltip.Popup>
          </Tooltip.Root>

          <Tooltip.Root side="top">
            <Tooltip.Trigger
              render={
                <SeekButton
                  seconds={-SEEK_TIME}
                  render={(props) => (
                    <Button {...props} className="media-button--icon media-button--seek">
                      <span className="media-icon__container">
                        <svg className="media-icon media-icon--seek media-icon--flipped" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M1 9c0 2.21.895 4.21 2.343 5.657l1.414-1.414a6 6 0 1 1 8.956-7.956l-1.286 1.286a.25.25 0 0 0 .177.427h4.146a.25.25 0 0 0 .25-.25V2.604a.25.25 0 0 0-.427-.177l-1.438 1.438A8 8 0 0 0 1 9"/></svg>
                        <span className="media-icon__label">{SEEK_TIME}</span>
                      </span>
                    </Button>
                  )}
                />
              }
            />
            <Tooltip.Popup className="media-surface media-tooltip">Seek backward {SEEK_TIME} seconds</Tooltip.Popup>
          </Tooltip.Root>

          <Tooltip.Root side="top">
            <Tooltip.Trigger
              render={
                <SeekButton
                  seconds={SEEK_TIME}
                  render={(props) => (
                    <Button {...props} className="media-button--icon media-button--seek">
                      <span className="media-icon__container">
                        <svg className="media-icon media-icon--seek" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M1 9c0 2.21.895 4.21 2.343 5.657l1.414-1.414a6 6 0 1 1 8.956-7.956l-1.286 1.286a.25.25 0 0 0 .177.427h4.146a.25.25 0 0 0 .25-.25V2.604a.25.25 0 0 0-.427-.177l-1.438 1.438A8 8 0 0 0 1 9"/></svg>
                        <span className="media-icon__label">{SEEK_TIME}</span>
                      </span>
                    </Button>
                  )}
                />
              }
            />
            <Tooltip.Popup className="media-surface media-tooltip">Seek forward {SEEK_TIME} seconds</Tooltip.Popup>
          </Tooltip.Root>

          <Time.Group className="media-time">
            <Time.Value type="current" className="media-time__value" />
            <TimeSlider.Root className="media-slider">
              <TimeSlider.Track className="media-slider__track">
                <TimeSlider.Fill className="media-slider__fill" />
                <TimeSlider.Buffer className="media-slider__buffer" />
              </TimeSlider.Track>
              <TimeSlider.Thumb className="media-slider__thumb" />
            </TimeSlider.Root>
            <Time.Value type="duration" className="media-time__value" />
          </Time.Group>

          <Tooltip.Root side="top">
            <Tooltip.Trigger
              render={
                <PlaybackRateButton
                  render={(props) => <Button {...props} className="media-button--icon media-button--playback-rate" />}
                />
              }
            />
            <Tooltip.Popup className="media-surface media-tooltip">Toggle playback rate</Tooltip.Popup>
          </Tooltip.Root>

          <Popover.Root openOnHover delay={200} closeDelay={100} side="top">
            <Popover.Trigger
              render={
                <MuteButton
                  render={(props) => (
                    <Button {...props} className="media-button--icon media-button--mute">
                      <svg className="media-icon media-icon--volume-off" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752M14.5 7.586l-1.768-1.768a1 1 0 1 0-1.414 1.414L13.085 9l-1.767 1.768a1 1 0 0 0 1.414 1.414l1.768-1.768 1.768 1.768a1 1 0 0 0 1.414-1.414L15.914 9l1.768-1.768a1 1 0 0 0-1.414-1.414z"/></svg>
                      <svg className="media-icon media-icon--volume-low" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"/></svg>
                      <svg className="media-icon media-icon--volume-high" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M15.6 3.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4C15.4 5.9 16 7.4 16 9s-.6 3.1-1.8 4.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3C17.1 13.2 18 11.2 18 9s-.9-4.2-2.4-5.7"/><path fill="currentColor" d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"/></svg>
                    </Button>
                  )}
                />
              }
            />
            <Popover.Popup className="media-surface media-popover media-popover--volume">
              <VolumeSlider.Root className="media-slider" orientation="vertical" thumbAlignment="edge">
                <VolumeSlider.Track className="media-slider__track">
                  <VolumeSlider.Fill className="media-slider__fill" />
                </VolumeSlider.Track>
                <VolumeSlider.Thumb className="media-slider__thumb media-slider__thumb--persistent" />
              </VolumeSlider.Root>
            </Popover.Popup>
          </Popover.Root>

          <Tooltip.Root side="top">
            <Tooltip.Trigger
              render={
                <CaptionsButton
                  render={(props) => (
                    <Button {...props} className="media-button--icon media-button--captions">
                      <svg className="media-icon media-icon--captions-off" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><rect width="16" height="12" x="1" y="3" stroke="currentColor" strokeWidth="2" rx="3"/><rect width="3" height="2" x="3" y="8" fill="currentColor" rx="1"/><rect width="2" height="2" x="13" y="8" fill="currentColor" rx="1"/><rect width="4" height="2" x="11" y="11" fill="currentColor" rx="1"/><rect width="5" height="2" x="7" y="8" fill="currentColor" rx="1"/><rect width="7" height="2" x="3" y="11" fill="currentColor" rx="1"/></svg>
                      <svg className="media-icon media-icon--captions-on" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M15 2a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zM4 11a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2zm8 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2zM4 8a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zm4 0a1 1 0 0 0 0 2h3a1 1 0 1 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/></svg>
                    </Button>
                  )}
                />
              }
            />
            <Tooltip.Popup className="media-surface media-tooltip">
              <CaptionsLabel />
            </Tooltip.Popup>
          </Tooltip.Root>

          <Tooltip.Root side="top">
            <Tooltip.Trigger
              render={
                <PiPButton
                  render={(props) => (
                    <Button {...props} className="media-button--icon">
                      <svg className="media-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M13 2a4 4 0 0 1 4 4v2.035A3.5 3.5 0 0 0 16.5 8H15V6.273C15 5.018 13.96 4 12.679 4H4.32C3.04 4 2 5.018 2 6.273v5.454C2 12.982 3.04 14 4.321 14H6v1.5q0 .255.035.5H4a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"/><rect width="10" height="7" x="8" y="10" fill="currentColor" rx="2"/></svg>
                    </Button>
                  )}
                />
              }
            />
            <Tooltip.Popup className="media-surface media-tooltip">
              <PiPLabel />
            </Tooltip.Popup>
          </Tooltip.Root>

          <Tooltip.Root side="top">
            <Tooltip.Trigger
              render={
                <FullscreenButton
                  render={(props) => (
                    <Button {...props} className="media-button--icon media-button--fullscreen">
                      <svg className="media-icon media-icon--fullscreen-enter" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M9.57 3.617A1 1 0 0 0 8.646 3H4c-.552 0-1 .449-1 1v4.646a.996.996 0 0 0 1.001 1 1 1 0 0 0 .706-.293l4.647-4.647a1 1 0 0 0 .216-1.089m4.812 4.812a1 1 0 0 0-1.089.217l-4.647 4.647a.998.998 0 0 0 .708 1.706H14c.552 0 1-.449 1-1V9.353a1 1 0 0 0-.618-.924"/></svg>
                      <svg className="media-icon media-icon--fullscreen-exit" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M7.883 1.93a.99.99 0 0 0-1.09.217L2.146 6.793A.998.998 0 0 0 2.853 8.5H7.5c.551 0 1-.449 1-1V2.854a1 1 0 0 0-.617-.924m7.263 7.57H10.5c-.551 0-1 .449-1 1v4.646a.996.996 0 0 0 1.001 1.001 1 1 0 0 0 .706-.293l4.646-4.646a.998.998 0 0 0-.707-1.707z"/></svg>
                    </Button>
                  )}
                />
              }
            />
            <Tooltip.Popup className="media-surface media-tooltip">
              <FullscreenLabel />
            </Tooltip.Popup>
          </Tooltip.Root>
        </Tooltip.Provider>
      </Controls.Root>

      <div className="media-overlay" />
    </Container>
  );
}

interface HlsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
}

function isHlsSource(source: string) {
  return source.includes(".m3u8");
}

export default function HlsPlayer({ src, title, poster }: HlsPlayerProps) {
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const MediaComponent = useMemo(() => (src && isHlsSource(src) ? HlsVideo : Video), [src]);

  const enterFullscreen = useCallback(() => {
    if (playerRef.current) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      } else if ((playerRef.current as any).webkitRequestFullscreen) {
        (playerRef.current as any).webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if ((document as any).webkitFullscreenElement) {
      (document as any).webkitExitFullscreen();
    }
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, exitFullscreen]);

  if (!src) {
    return (
      <div className="watch-player-shell relative w-full aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(229,9,20,0.15),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))]" />
        <div className="relative flex h-full items-center justify-center">
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <AlertCircle className="h-10 w-10 text-zinc-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Stream Not Available</h3>
            <p className="text-zinc-500">This content does not have an HLS stream yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const Player = Video as any;

  return (
    <div 
      ref={playerRef}
      className={`watch-player-shell watch-player-shell--react watch-player-shell--netflix relative w-full aspect-video overflow-hidden rounded-[20px] sm:rounded-[24px] border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.45)] ${isFullscreen ? 'fixed inset-0 z-[9999] aspect-video !rounded-none' : ''}`}
    >
      {!isFullscreen && (
        <>
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.18))]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-black/72 via-black/28 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-black via-black/78 to-transparent" />
          <div className="pointer-events-none absolute left-3 top-3 z-[2] flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-white/80 sm:left-4 sm:top-4 sm:px-3 sm:text-[11px] sm:tracking-[0.2em]">
            {isHlsSource(src) ? "HLS STREAM" : "VIDEO STREAM"}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between p-3 sm:p-4">
            <div className="max-w-[68%]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45 sm:text-[11px]">Watching Now</p>
              <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-white sm:text-lg">{title}</h3>
            </div>
          </div>
        </>
      )}

      <Player.Provider 
        key={`${src}-${reloadKey}`}
      >
        <VideoSkin className="h-full w-full">
          <MediaComponent
            src={src}
            poster={poster}
            playsInline
            preload="auto"
            aria-label={title}
            className="h-full w-full object-cover"
            onPlay={enterFullscreen}
          />
        </VideoSkin>
      </Player.Provider>

      <div className={`absolute z-[3] flex gap-2 ${isFullscreen ? 'top-4 right-4' : 'right-3 top-3 sm:right-4 sm:top-4'}`}>
        <button
          type="button"
          onClick={() => setReloadKey((current) => current + 1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-black/75 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          {!isFullscreen && <span>Reload</span>}
        </button>
        {!isFullscreen && (
          <button
            type="button"
            onClick={enterFullscreen}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-black/75 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Fullscreen
          </button>
        )}
        {isFullscreen && (
          <button
            type="button"
            onClick={exitFullscreen}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-black/75"
          >
            <Minimize2 className="h-4 w-4" />
            Exit
          </button>
        )}
      </div>
    </div>
  );
}
