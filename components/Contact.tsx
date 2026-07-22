"use client";

import {
  CheckCircle2,
  LoaderCircle,
  Mail,
  MapPin,
  MessageSquareText,
  Send,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export default function Contact() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ?? "Unable to send your message."
        );
      }

      setSuccessMessage(
        result.message ??
          "Thank you. Your message has been received."
      );

      setForm(initialFormState);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send your message."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="contact"
      className="scroll-mt-20 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 py-20 text-white sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
            Contact us
          </p>

          <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
            We would love to hear from you
          </h2>

          <p className="mt-5 text-lg leading-8 text-blue-100">
            Send us your questions, suggestions or feedback about the AI
            Travel Planner.
          </p>
        </div>

        <div className="mt-14 grid overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-[0.8fr_1.2fr]">
          <div className="bg-gray-950 p-8 text-white sm:p-10">
            <h3 className="text-2xl font-bold">Get in touch</h3>

            <p className="mt-4 leading-7 text-gray-300">
              Your feedback helps us improve the travel-planning
              experience.
            </p>

            <div className="mt-10 space-y-7">
              <ContactDetail
                icon={<Mail size={22} />}
                title="Email"
                value="support@aitravelplanner.com"
              />

              <ContactDetail
                icon={<MapPin size={22} />}
                title="Location"
                value="Chennai, Tamil Nadu, India"
              />

              <ContactDetail
                icon={<MessageSquareText size={22} />}
                title="Support"
                value="Send your message using this form"
              />
            </div>

            <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-sm leading-6 text-gray-300">
                Please do not include passwords, payment details or other
                sensitive personal information in your message.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-8 text-gray-900 dark:bg-gray-900 dark:text-white sm:p-10"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                label="Your name"
                required
              >
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  maxLength={100}
                  required
                  autoComplete="name"
                  placeholder="Enter your name"
                  className="form-input"
                />
              </FormField>

              <FormField
                label="Email address"
                required
              >
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  maxLength={254}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="form-input"
                />
              </FormField>
            </div>

            <div className="mt-6">
              <FormField label="Subject">
                <input
                  type="text"
                  value={form.subject}
                  onChange={(event) =>
                    updateField("subject", event.target.value)
                  }
                  maxLength={150}
                  placeholder="How can we help?"
                  className="form-input"
                />
              </FormField>
            </div>

            <div className="mt-6">
              <FormField
                label="Message"
                required
              >
                <textarea
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  rows={6}
                  minLength={10}
                  maxLength={3000}
                  required
                  placeholder="Write your message here..."
                  className="form-input resize-none"
                />

                <p className="mt-2 text-right text-xs text-gray-500 dark:text-gray-400">
                  {form.message.length}/3000
                </p>
              </FormField>
            </div>

            <div
              className="absolute -left-[9999px]"
              aria-hidden="true"
            >
              <label htmlFor="website">Website</label>

              <input
                id="website"
                type="text"
                value={form.website}
                onChange={(event) =>
                  updateField("website", event.target.value)
                }
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
              >
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={20}
                    className="animate-spin"
                  />
                  Sending Message...
                </>
              ) : (
                <>
                  <Send size={19} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

type ContactDetailProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
};

function ContactDetail({
  icon,
  title,
  value,
}: ContactDetailProps) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
        {icon}
      </span>

      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-gray-300">{value}</p>
      </div>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

function FormField({
  label,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      {children}
    </label>
  );
}