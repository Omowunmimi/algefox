'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AyoMascot } from '@/components/mascot/AyoMascot';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuitConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;  // quit the lesson
  onCancel: () => void;   // stay in lesson
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuitConfirmModal({ isOpen, onConfirm, onCancel }: QuitConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      showHandle
    >
      <div className="flex flex-col items-center gap-5 py-4">
        {/* Sad mascot */}
        <AyoMascot expression="sad" size={80} />

        {/* Copy */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-display text-xl font-bold text-gray-900">
            Are you sure you want to quit?
          </h2>
          <p className="font-ui text-sm text-gray-600">
            You&apos;ll lose your progress in this level.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onCancel}
          >
            Keep going!
          </Button>
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={onConfirm}
          >
            Quit
          </Button>
        </div>
      </div>
    </Modal>
  );
}
