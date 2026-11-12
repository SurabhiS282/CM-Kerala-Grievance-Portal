export default function About() {
  return (
    <div className="page">
      <section className="section">
        <h1 className="page-title">About the Grievance Portal</h1>
        <p className="page-subtitle">
          An initiative by the Chief Minister's Office, Government of Kerala, to
          establish a transparent and efficient mechanism for addressing citizen
          grievances.
        </p>
      </section>

      {/* Purpose */}
      <section className="section">
        <h2 className="section-title">Purpose</h2>
        <div className="content-block">
          <p>
            The Chief Minister's Public Grievance Redressal Portal serves as a
            centralized platform where citizens of Kerala can submit their
            grievances directly to the government. The portal ensures that every
            complaint is tracked, reviewed, and resolved in a systematic and
            time-bound manner.
          </p>
          <p>
            By leveraging modern technology, including AI-powered analysis, the
            portal streamlines the grievance handling process, reducing bureaucratic
            delays and ensuring accountability at every level.
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <div className="grid grid-2">
        <section className="card">
          <h2 className="card-title">Our Vision</h2>
          <p className="card-description">
            To create a governance model where every citizen's voice is heard,
            valued, and acted upon — fostering trust between the people and the
            government of Kerala through responsive and transparent
            administration.
          </p>
        </section>

        <section className="card">
          <h2 className="card-title">Our Mission</h2>
          <p className="card-description">
            To provide an accessible, efficient, and technology-driven platform
            that empowers citizens to report grievances, enables government
            departments to respond effectively, and promotes a culture of
            accountability in public service delivery.
          </p>
        </section>
      </div>

      {/* Objectives */}
      <section className="section">
        <h2 className="section-title">Key Objectives</h2>
        <div className="grid grid-2">
          <div className="card">
            <h3 className="card-title">Citizen Empowerment</h3>
            <p className="card-description">
              Provide every citizen of Kerala, regardless of location or
              background, with equal access to the grievance redressal mechanism.
            </p>
          </div>
          <div className="card">
            <h3 className="card-title">Timely Resolution</h3>
            <p className="card-description">
              Ensure that grievances are acknowledged, investigated, and resolved
              within defined timeframes, with regular status updates to
              complainants.
            </p>
          </div>
          <div className="card">
            <h3 className="card-title">Departmental Accountability</h3>
            <p className="card-description">
              Hold government departments accountable through systematic tracking,
              performance metrics, and escalation protocols for pending
              grievances.
            </p>
          </div>
          <div className="card">
            <h3 className="card-title">Data-Driven Governance</h3>
            <p className="card-description">
              Leverage AI and analytics to identify systemic issues, prioritize
              critical grievances, and inform policy decisions for better public
              service.
            </p>
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="section section-highlighted">
        <h2 className="section-title">Commitment to Transparency</h2>
        <div className="content-block">
          <p>
            Transparency is at the heart of this initiative. The portal provides
            citizens with real-time tracking of their grievance status, ensures all
            communications are documented, and maintains a clear audit trail from
            submission to resolution.
          </p>
          <p>
            Every grievance is assigned a unique reference number, and citizens can
            track their complaint's progress through each stage — from initial
            review to departmental action and final resolution. The system also
            collects citizen feedback to continuously improve service quality.
          </p>
          <p>
            Regular performance reports and analytics are generated to monitor
            departmental responsiveness, identify bottlenecks, and ensure the
            highest standards of public service delivery.
          </p>
        </div>
      </section>
    </div>
  );
}
