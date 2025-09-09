import { useEffect, useRef, useState } from "react";

export type AmbienceState = {
  bpm: number;
  key: string;
  volumes: { pad: number; pratos: number; bumbo: number; vocoder: number };
  playing: boolean;
};

export function useAmbienceAudioEngine(initial?: Partial<AmbienceState>) {
  const [state, setState] = useState<AmbienceState>({
    bpm: initial?.bpm ?? 72,
    key: initial?.key ?? "C",
    volumes: initial?.volumes ?? { pad: 50, pratos: 25, bumbo: 35, vocoder: 20 },
    playing: false,
  });

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const padRef = useRef<GainNode | null>(null);
  const pratosRef = useRef<GainNode | null>(null);
  const bumboRef = useRef<GainNode | null>(null);
  const vocoderRef = useRef<GainNode | null>(null);

  const padOsc = useRef<OscillatorNode | null>(null);
  const vocoderOsc = useRef<OscillatorNode | null>(null);
  const noiseSrc = useRef<AudioBufferSourceNode | null>(null);
  const kickOsc = useRef<OscillatorNode | null>(null);
  const kickGain = useRef<GainNode | null>(null);

  function ensureContext() {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctxRef.current = ctx;
      masterRef.current = ctx.createGain();
      masterRef.current.gain.value = 1;
      masterRef.current.connect(ctx.destination);

      padRef.current = ctx.createGain();
      pratosRef.current = ctx.createGain();
      bumboRef.current = ctx.createGain();
      vocoderRef.current = ctx.createGain();

      padRef.current.connect(masterRef.current);
      pratosRef.current.connect(masterRef.current);
      bumboRef.current.connect(masterRef.current);
      vocoderRef.current.connect(masterRef.current);
    }
  }

  function linearRamp(g: GainNode | null, value: number, time = 0.15) {
    const ctx = ctxRef.current;
    if (!ctx || !g) return;
    const now = ctx.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setTargetAtTime(value, now, time);
  }

  function start() {
    ensureContext();
    const ctx = ctxRef.current!;

    // PAD – suave seno com filtro leve
    if (!padOsc.current) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 220; // base; não tonal real por enquanto
      const gain = padRef.current!;
      osc.connect(gain);
      osc.start();
      padOsc.current = osc;
    }

    // PRATOS – ruído branco filtrado
    if (!noiseSrc.current) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 6000;
      src.connect(filter).connect(pratosRef.current!);
      src.start();
      noiseSrc.current = src;
    }

    // BUMBO – pulso suave em função do BPM
    if (!kickOsc.current) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 60;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain).connect(bumboRef.current!);
      osc.start();
      kickOsc.current = osc;
      kickGain.current = gain;
    }

    if (!vocoderOsc.current) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 440;
      osc.connect(vocoderRef.current!);
      osc.start();
      vocoderOsc.current = osc;
    }

    setState((s) => ({ ...s, playing: true }));
  }

  function stop() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    try {
      padOsc.current?.stop();
      noiseSrc.current?.stop();
      kickOsc.current?.stop();
      vocoderOsc.current?.stop();
    } catch {}
    padOsc.current = null;
    noiseSrc.current = null;
    kickOsc.current = null;
    vocoderOsc.current = null;
    setState((s) => ({ ...s, playing: false }));
  }

  // Simple kick envelope on interval
  useEffect(() => {
    if (!state.playing) return;
    ensureContext();
    const ctx = ctxRef.current!;
    const interval = Math.max(0.1, 60 / Math.max(1, state.bpm));
    const id = setInterval(() => {
      if (!kickGain.current || !ctx) return;
      const now = ctx.currentTime;
      kickGain.current.gain.cancelScheduledValues(now);
      kickGain.current.gain.setValueAtTime(0.8, now);
      kickGain.current.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    }, interval * 1000);
    return () => clearInterval(id);
  }, [state.playing, state.bpm]);

  function setVolume(layer: keyof AmbienceState["volumes"], value: number) {
    ensureContext();
    const v = Math.min(100, Math.max(0, value));
    setState((s) => ({ ...s, volumes: { ...s.volumes, [layer]: v } }));
    const gainLinear = v / 100;
    const map: Record<string, GainNode | null> = {
      pad: padRef.current,
      pratos: pratosRef.current,
      bumbo: bumboRef.current,
      vocoder: vocoderRef.current,
    };
    linearRamp(map[layer], gainLinear);
  }

  function setBpm(bpm: number) {
    setState((s) => ({ ...s, bpm: Math.round(Math.max(30, Math.min(220, bpm))) }));
  }

  function setKey(key: string) {
    setState((s) => ({ ...s, key }));
  }

  // initialize volumes when context exists
  useEffect(() => {
    ensureContext();
    setTimeout(() => {
      setVolume("pad", state.volumes.pad);
      setVolume("pratos", state.volumes.pratos);
      setVolume("bumbo", state.volumes.bumbo);
      setVolume("vocoder", state.volumes.vocoder);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    start,
    stop,
    setVolume,
    setBpm,
    setKey,
  };
}
