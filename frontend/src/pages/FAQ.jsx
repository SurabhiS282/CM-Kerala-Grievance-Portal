import { useState } from 'react';

const faqData = [
  {
    question: 'How do I register on the portal?',
    answer:
      'Click on the "Register" link in the navigation bar or login page. Fill in your full name, email address, mobile number, and create a password. After successful registration, you can log in and submit grievances.',
  },
  {
    question: 'How do I submit a grievance?',
    answer:
      'After logging in, navigate to "Submit Grievance" from the dashboard or navigation menu. Fill in the required details including subject, description, category, and district. You may also attach supporting documents such as images or PDFs. Submit the form to receive a unique reference number for tracking.',
  },
  {
    question: 'How can I track my grievance?',
    answer:
      'You can track your grievance using the reference number provided at the time of submission. Visit the "Track Grievance" page, enter your reference number, and view the current status, assigned department, and complete history of actions taken.',
  },
  {
    question: 'What documents can I attach to my grievance?',
    answer:
      'You can attach supporting documents in common formats including JPEG, PNG, and PDF. The maximum file size is 5MB per attachment. Documents may include photographs, official letters, receipts, or any evidence relevant to your grievance.',
  },
  {
    question: 'How long does it take to resolve a grievance?',
    answer:
      'Resolution timelines vary depending on the nature and complexity of the grievance. Simple complaints may be resolved within 7-15 working days, while complex issues involving multiple departments may take up to 30-45 working days. You will receive regular updates on the progress of your grievance.',
  },
  {
    question: 'Can I reopen a resolved grievance?',
    answer:
      'If you are not satisfied with the resolution, you can provide feedback through the portal indicating your dissatisfaction. The grievance may be reviewed again by the CMO. However, direct reopening of a closed grievance is managed by the CMO based on the feedback and circumstances.',
  },
  {
    question: 'Is my personal information secure?',
    answer:
      'Yes, the portal uses industry-standard security measures to protect your personal information. All data is encrypted in transit and at rest. Your grievance details are accessible only to authorized government officials involved in the resolution process. We comply with applicable data protection regulations.',
  },
  {
    question: 'How does AI analysis work on my grievance?',
    answer:
      'When you submit a grievance, an AI engine analyzes the content to determine the priority level, sentiment, and most appropriate category. It also suggests the best-suited department for handling the issue. This helps speed up the initial review process and ensures your grievance reaches the right officials quickly.',
  },
  {
    question: 'Who reviews my grievance?',
    answer:
      'Your grievance is initially reviewed by officials at the Chief Minister\'s Office (CMO). Based on the nature of the complaint, it is then assigned to the relevant government department. A designated officer in that department investigates the matter and submits a report, which is then reviewed by the CMO before final resolution.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="page">
      <section className="section">
        <h1 className="page-title">Frequently Asked Questions</h1>
        <p className="page-subtitle">
          Find answers to common questions about the grievance portal and the
          redressal process.
        </p>
      </section>

      <section className="section">
        <div className="faq-list">
          {faqData.map((item, index) => (
            <div
              className={`faq-item ${openIndex === index ? 'faq-item-open' : ''}`}
              key={index}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span>{item.question}</span>
                <span className="faq-toggle">{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
