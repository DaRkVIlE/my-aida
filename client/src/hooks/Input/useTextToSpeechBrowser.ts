import { useState, useEffect, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import type { VoiceOption } from '~/common';
import store from '~/store';

function useTextToSpeechBrowser({
  setIsSpeaking,
}: {
  setIsSpeaking: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const voiceName = useRecoilValue(store.voice);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const cloudBrowserVoices = useRecoilValue(store.cloudBrowserVoices);
  const [isSpeechSynthesisSupported, setIsSpeechSynthesisSupported] = useState(true);

  const updateVoices = useCallback(() => {
    const synth = window.speechSynthesis as SpeechSynthesis | undefined;
    if (!synth) {
      setIsSpeechSynthesisSupported(false);
      return;
    }

    try {
      const availableVoices = synth.getVoices();
      if (!Array.isArray(availableVoices)) {
        console.error('getVoices() did not return an array');
        return;
      }

      const filteredVoices = availableVoices.filter(
        (v) => cloudBrowserVoices || v.localService === true,
      );
      const voiceOptions: VoiceOption[] = filteredVoices.map((v) => ({
        value: v.name,
        label: v.name,
      }));

      setVoices(voiceOptions);
    } catch (error) {
      console.error('Error updating voices:', error);
      setIsSpeechSynthesisSupported(false);
    }
  }, [cloudBrowserVoices]);

  useEffect(() => {
    const synth = window.speechSynthesis as SpeechSynthesis | undefined;
    if (!synth) {
      setIsSpeechSynthesisSupported(false);
      return;
    }

    try {
      if (synth.getVoices().length) {
        updateVoices();
      } else {
        synth.onvoiceschanged = updateVoices;
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
      setIsSpeechSynthesisSupported(false);
    }

    return () => {
      if (synth.onvoiceschanged) {
        synth.onvoiceschanged = null;
      }
    };
  }, [updateVoices]);

  const generateSpeechLocal = (text: string) => {
    if (!isSpeechSynthesisSupported) {
      console.warn('Speech synthesis is not supported');
      return;
    }

    const synth = window.speechSynthesis;
    const voice = voices.find((v) => v.value === voiceName);

    if (!voice) {
      console.warn('Selected voice not found');
      return;
    }

    try {
      synth.cancel();
      // Remove emojis and symbols so TTS does not pronounce emoji descriptions (e.g. 'smiling face')
      const cleanText = text
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}-\u{2454}\u{20D0}-\u{20FF}\u{FE0F}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText || text);
      utterance.voice = synth.getVoices().find((v) => v.name === voice.value) || null;
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = (event) => {
        if (event.error === 'interrupted' || event.error === 'canceled') {
          setIsSpeaking(false);
          return;
        }

        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      setIsSpeaking(true);
      synth.speak(utterance);
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
    }
  };

  const cancelSpeechLocal = () => {
    if (!isSpeechSynthesisSupported) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch (error) {
      console.error('Error cancelling speech:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return { generateSpeechLocal, cancelSpeechLocal, voices, isSpeechSynthesisSupported };
}

export default useTextToSpeechBrowser;
