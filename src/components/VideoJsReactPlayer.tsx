import { selectError } from '@videojs/core/dom';
import { type ComponentProps, forwardRef, type ReactNode, useRef, type PropsWithChildren, type CSSProperties } from 'react';

import { AlertDialog, Container, usePlayer, BufferingIndicator, CaptionsButton, Controls, FullscreenButton, MuteButton, PiPButton, PlayButton, PlaybackRateButton, Popover, SeekButton, Time, TimeSlider, Tooltip, VolumeSlider } from '@videojs/react';

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

export type MinimalVideoSkinProps = PropsWithChildren<{ style?: CSSProperties; className?: string }>;

const Button = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(function Button({ className, ...props }, ref) {
  return <button ref={ref} type="button" className={['media-button', className].filter(Boolean).join(' ')} {...props} />;
});

const errorClasses = {
  root: 'media-error',
  dialog: 'media-error__dialog',
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

export function MinimalVideoSkin(props: MinimalVideoSkinProps): ReactNode {
  const { children, className, ...rest } = props;

  return (
    <Container className={['media-minimal-skin media-minimal-skin--video', className].filter(Boolean).join(' ')} {...rest}>
      {children}

      <BufferingIndicator
        render={(props) => (
          <div {...props} className="media-buffering-indicator">
            <svg className="media-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" aria-hidden="true" viewBox="0 0 18 18"><rect width="2" height="5" x="8" y=".5" opacity=".5" rx="1"><animate attributeName="opacity" begin="0s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="2" height="5" x="12.243" y="2.257" opacity=".45" rx="1" transform="rotate(45 13.243 4.757)"><animate attributeName="opacity" begin="0.125s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x="12.5" y="8" opacity=".4" rx="1"><animate attributeName="opacity" begin="0.25s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x="10.743" y="12.243" opacity=".35" rx="1" transform="rotate(45 13.243 13.243)"><animate attributeName="opacity" begin="0.375s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="2" height="5" x="8" y="12.5" opacity=".3" rx="1"><animate attributeName="opacity" begin="0.5s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="2" height="5" x="3.757" y="10.743" opacity=".25" rx="1" transform="rotate(45 4.757 13.243)"><animate attributeName="opacity" begin="0.625s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x=".5" y="8" opacity=".15" rx="1"><animate attributeName="opacity" begin="0.75s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect><rect width="5" height="2" x="2.257" y="3.757" opacity=".1" rx="1" transform="rotate(45 4.757 4.757)"><animate attributeName="opacity" begin="0.875s" calcMode="linear" dur="1s" repeatCount="indefinite" values="1;0"/></rect></svg>
          </div>
        )}
      />

      <ErrorDialog classes={errorClasses} />

      <Controls.Root className="media-controls">
        <span className="media-button-group">
          <Tooltip.Root side="top">
            <Tooltip.Trigger
              render={
                <PlayButton
                  render={(props) => (
                    <Button {...props} className="media-button--icon media-button--play">
                      <svg className="media-icon media-icon--restart" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M9 17a8 8 0 0 1-8-8h1.5a6.5 6.5 0 1 0 1.43-4.07l1.643 1.643A.25.25 0 0 1 5.396 7H1.25A.25.25 0 0 1 1 6.75V2.604a.25.25 0 0 1 .427-.177l1.438 1.438A8 8 0 1 1 9 17"/><path fill="currentColor" d="m11.61 9.639-3.331 2.07a.826.826 0 0 1-1.15-.266.86.86 0 0 1-.129-.452V6.849C7 6.38 7.374 6 7.834 6c.158 0 .312.045.445.13l3.331 2.071a.858.858 0 0 1 0 1.438"/></svg>
                      <svg className="media-icon media-icon--play" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="m13.473 10.476-6.845 4.256a1.697 1.697 0 0 1-2.364-.547 1.77 1.77 0 0 1-.264-.93v-8.51C4 3.78 4.768 3 5.714 3c.324 0 .64.093.914.268l6.845 4.255a1.763 1.763 0 0 1 0 2.953"/></svg>
                      <svg className="media-icon media-icon--pause" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><rect width="4" height="12" x="3" y="3" fill="currentColor" rx="1.75"/><rect width="4" height="12" x="11" y="3" fill="currentColor" rx="1.75"/></svg>
                    </Button>
                  )}
                />
              }
            />
            <Tooltip.Popup className="media-tooltip">
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
                        <svg className="media-icon media-icon--seek media-icon--flipped" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M1 9c0 2.21.895 4.21 2.343 5.657l1.06-1.06a6.5 6.5 0 1 1 9.665-8.665l-1.641 1.641a.25.25 0 0 0 .177.427h4.146a.25.25 0 0 0 .25-.25V2.604a.25.25 0 0 0-.427-.177l-1.438 1.438A8 8 0 0 0 1 9"/></svg>
                        <span className="media-icon__label">{SEEK_TIME}</span>
                      </span>
                    </Button>
                  )}
                />
              }
            />
            <Tooltip.Popup className="media-tooltip">Seek backward {SEEK_TIME} seconds</Tooltip.Popup>
          </Tooltip.Root>

          <Tooltip.Root side="top">
            <Tooltip.Trigger
              render={
                <SeekButton
                  seconds={SEEK_TIME}
                  render={(props) => (
                    <Button {...props} className="media-button--icon media-button--seek">
                      <span className="media-icon__container">
                        <svg className="media-icon media-icon--seek" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M1 9c0 2.21.895 4.21 2.343 5.657l1.06-1.06a6.5 6.5 0 1 1 9.665-8.665l-1.641 1.641a.25.25 0 0 0 .177.427h4.146a.25.25 0 0 0 .25-.25V2.604a.25.25 0 0 0-.427-.177l-1.438 1.438A8 8 0 0 0 1 9"/></svg>
                        <span className="media-icon__label">{SEEK_TIME}</span>
                      </span>
                    </Button>
                  )}
                />
              }
            />
            <Tooltip.Popup className="media-tooltip">Seek forward {SEEK_TIME} seconds</Tooltip.Popup>
          </Tooltip.Root>
        </span>

        <span className="media-time-controls">
          <Time.Group className="media-time">
            <Time.Value type="current" className="media-time__value media-time__value--current" />
            <Time.Separator className="media-time__separator" />
            <Time.Value type="duration" className="media-time__value media-time__value--duration" />
          </Time.Group>

          <TimeSlider.Root className="media-slider">
            <TimeSlider.Track className="media-slider__track">
              <TimeSlider.Fill className="media-slider__fill" />
              <TimeSlider.Buffer className="media-slider__buffer" />
            </TimeSlider.Track>
            <TimeSlider.Thumb className="media-slider__thumb" />
          </TimeSlider.Root>
        </span>

        <span className="media-button-group">
          <Tooltip.Root side="top">
            <Tooltip.Trigger
              render={
                <PlaybackRateButton
                  render={(props) => <Button {...props} className="media-button--icon media-button--playback-rate" />}
                />
              }
            />
            <Tooltip.Popup className="media-tooltip">Toggle playback rate</Tooltip.Popup>
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
            <Popover.Popup className="media-popover media-popover--volume">
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
                      <svg className="media-icon media-icon--captions-off" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><rect width="16.5" height="12.5" x=".75" y="2.75" stroke="currentColor" strokeWidth="1.5" rx="3"/><rect width="3" height="1.5" x="3" y="8.5" fill="currentColor" rx=".75"/><rect width="2" height="1.5" x="13" y="8.5" fill="currentColor" rx=".75"/><rect width="4" height="1.5" x="11" y="11.5" fill="currentColor" rx=".75"/><rect width="5" height="1.5" x="7" y="8.5" fill="currentColor" rx=".75"/><rect width="7" height="1.5" x="3" y="11.5" fill="currentColor" rx=".75"/></svg>
                      <svg className="media-icon media-icon--captions-on" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M15 2a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zM3.75 11.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5zm8 0a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zm-8-3a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5zm4 0a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5zm6 0a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5z"/></svg>
                    </Button>
                  )}
                />
              }
            />
            <Tooltip.Popup className="media-tooltip">
              <CaptionsLabel />
            </Tooltip.Popup>
          </Tooltip.Root>

          <Tooltip.Root side="top">
            <Tooltip.Trigger
              render={
                <PiPButton
                  render={(props) => (
                    <Button {...props} className="media-button--icon">
                      <svg className="media-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M13 2a4 4 0 0 1 4 4v2.645a3.5 3.5 0 0 0-1-.145h-.5V6A2.5 2.5 0 0 0 13 3.5H4A2.5 2.5 0 0 0 1.5 6v6A2.5 2.5 0 0 0 4 14.5h2.5v.5c0 .347.05.683.145 1H4a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"/><rect width="10" height="7" x="8" y="10" fill="currentColor" rx="2"/></svg>
                    </Button>
                  )}
                />
              }
            />
            <Tooltip.Popup className="media-tooltip">
              <PiPLabel />
            </Tooltip.Popup>
          </Tooltip.Root>

          <Tooltip.Root side="top">
            <Tooltip.Trigger
              render={
                <FullscreenButton
                  render={(props) => (
                    <Button {...props} className="media-button--icon media-button--fullscreen">
                      <svg className="media-icon media-icon--fullscreen-enter" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M15.25 2a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V3.5h-3.75a.75.75 0 0 1-.743-.648L10 2.75a.75.75 0 0 1 .75-.75z"/><path fill="currentColor" d="M14.72 2.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06zM2.75 10a.75.75 0 0 1 .75.75v3.75h3.75a.75.75 0 0 1 .743.648L8 15.25a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75"/><path fill="currentColor" d="M6.72 10.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06z"/></svg>
                      <svg className="media-icon media-icon--fullscreen-exit" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" aria-hidden="true" viewBox="0 0 18 18"><path fill="currentColor" d="M10.75 2a.75.75 0 0 1 .75.75V6.5h3.75a.75.75 0 0 1 .743.648L16 7.25a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75"/><path fill="currentColor" d="M14.72 2.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06zM7.25 10a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V11.5H2.75a.75.75 0 0 1-.743-.648L2 10.75a.75.75 0 0 1 .75-.75z"/><path fill="currentColor" d="M6.72 10.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06z"/></svg>
                    </Button>
                  )}
                />
              }
            />
            <Tooltip.Popup className="media-tooltip">
              <FullscreenLabel />
            </Tooltip.Popup>
          </Tooltip.Root>
        </span>
      </Controls.Root>

      <div className="media-overlay" />
    </Container>
  );
}
