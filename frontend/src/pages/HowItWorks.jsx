export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Register & Submit',
      description:
        'Create an account on the portal and submit your grievance by filling out the online form. Provide details about your complaint, select the relevant category and district, and attach any supporting documents.',
      details: [
        'Fill in grievance details — subject, description, category',
        'Select the district and location',
        'Attach supporting documents (images, PDFs)',
        'Submit the form to receive a unique reference number',
      ],
    },
    {
      number: 2,
      title: 'Reference Number & AI Analysis',
      description:
        'Upon submission, the system generates a unique reference number for tracking. An AI-powered engine analyzes your grievance to determine priority, categorize the issue, and suggest the appropriate department for resolution.',
      details: [
        'Unique reference number generated (e.g., GRV-KL-2025-001234)',
        'AI analyzes grievance for priority and sentiment',
        'Automatic categorization and department suggestion',
        'Acknowledgement sent via email notification',
      ],
    },
    {
      number: 3,
      title: 'CMO Review & Assignment',
      description:
        'The Chief Minister\'s Office reviews the grievance along with the AI recommendations. The CMO assigns it to the appropriate government department for investigation and action.',
      details: [
        'CMO dashboard shows new grievances with AI insights',
        'Priority and department assignment confirmed or adjusted',
        'Grievance forwarded to the responsible department',
        'Status updated to "Assigned" — citizen notified',
      ],
    },
    {
      number: 4,
      title: 'Department Investigation',
      description:
        'The assigned department officer investigates the grievance, conducts necessary field work, and prepares a response report detailing the findings and actions taken.',
      details: [
        'Department officer receives grievance assignment',
        'Investigation and field verification conducted',
        'Officer prepares response report with findings',
        'Report submitted to CMO for review',
      ],
    },
    {
      number: 5,
      title: 'CMO Review & Resolution',
      description:
        'The CMO reviews the department\'s response report. If satisfactory, the grievance is marked as resolved. If further action is needed, it may be reassigned or escalated.',
      details: [
        'CMO reviews officer\'s report and actions taken',
        'Grievance marked as "Resolved" if satisfactory',
        'May be sent back for further investigation if needed',
        'Resolution details recorded in the system',
      ],
    },
    {
      number: 6,
      title: 'Citizen Update & Feedback',
      description:
        'The citizen is notified of the resolution via email and can view the full details on the portal. A feedback mechanism allows citizens to rate their experience and provide comments.',
      details: [
        'Citizen receives notification of resolution',
        'Full resolution details available on the portal',
        'Citizen can rate satisfaction (1-5 stars)',
        'Feedback used to improve service quality',
      ],
    },
  ];

  return (
    <div className="page">
      <section className="section">
        <h1 className="page-title">How It Works</h1>
        <p className="page-subtitle">
          A step-by-step guide to submitting and tracking your grievance through
          the Chief Minister's Grievance Redressal Portal.
        </p>
      </section>

      <section className="section">
        <div className="timeline">
          {steps.map((step) => (
            <div className="timeline-item" key={step.number}>
              <div className="timeline-marker">
                <span className="timeline-number">{step.number}</span>
              </div>
              <div className="timeline-content">
                <h3 className="timeline-title">{step.title}</h3>
                <p className="timeline-description">{step.description}</p>
                <ul className="timeline-details">
                  {step.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
