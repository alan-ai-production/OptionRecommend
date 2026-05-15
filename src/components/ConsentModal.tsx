import { Check } from "lucide-react";
import { DISCLAIMER } from "./disclaimer";
import { Modal } from "./Modal";

export function ConsentModal({ onAccept }: { onAccept: () => void }) {
  return (
    <Modal title="Before You Continue" onClose={() => undefined} showCloseButton={false}>
      <div className="consent-content">
        <section className="consent-section">
          <h3>Disclaimer</h3>
          <p>{DISCLAIMER}</p>
        </section>

        <section className="consent-section">
          <h3>Privacy & Storage</h3>
          <p>
            This app does not use tracking cookies. It uses essential browser local storage to save
            tabs, sections, entries, prompt templates, theme preferences, backup/import data, and
            this acknowledgement on your device.
          </p>
        </section>

        <button className="primary-button full" onClick={onAccept} type="button">
          <Check aria-hidden="true" />
          <span>I Understand</span>
        </button>
      </div>
    </Modal>
  );
}
