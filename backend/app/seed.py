"""
Seed script to populate the database with demo data.
Run: cd backend && python -m app.seed
"""
import uuid
from datetime import datetime, timedelta, timezone
from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.department import Department
from app.models.grievance import Grievance, GrievanceHistory
from app.models.assignment import DepartmentAssignment
from app.models.contact import ContactEnquiry
from app.services.auth_service import hash_password

# Import all models
from app.models import Attachment


def seed():
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Department).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # --- Departments ---
        departments_data = [
            ("Public Works Department", "PWD", "Responsible for roads, bridges, and public infrastructure"),
            ("Health Department", "HEALTH", "Manages hospitals, clinics, and public health services"),
            ("Education Department", "EDU", "Oversees schools, colleges, and educational institutions"),
            ("Revenue Department", "REV", "Handles land records, taxes, and revenue collection"),
            ("Police Department", "POLICE", "Maintains law and order, crime prevention"),
            ("Transport Department", "TRANSPORT", "Manages public transport, licensing, and road safety"),
            ("Water Resources Department", "WATER", "Manages water supply, irrigation, and flood control"),
            ("Agriculture Department", "AGRI", "Supports farming, crop planning, and agricultural subsidies"),
            ("Housing Department", "HOUSING", "Manages public housing schemes and construction permits"),
            ("Labour Department", "LABOUR", "Handles labour welfare, workplace safety, and employment"),
        ]

        departments = {}
        for name, code, desc in departments_data:
            dept = Department(name=name, code=code, description=desc)
            db.add(dept)
            db.flush()
            departments[code] = dept

        # --- Users ---
        password_hash = hash_password("Demo@123")

        citizen = User(
            full_name="Arun Kumar",
            email="citizen@demo.com",
            mobile_number="9876543210",
            password_hash=password_hash,
            role="citizen",
        )
        db.add(citizen)

        cmo_admin = User(
            full_name="Dr. Priya Nair",
            email="cmo@demo.com",
            mobile_number="9876543211",
            password_hash=password_hash,
            role="cmo_admin",
        )
        db.add(cmo_admin)

        officer1 = User(
            full_name="Rajesh Menon",
            email="officer@demo.com",
            mobile_number="9876543212",
            password_hash=password_hash,
            role="officer",
            department_id=departments["PWD"].id,
        )
        db.add(officer1)

        officer2 = User(
            full_name="Lakshmi Pillai",
            email="officer2@demo.com",
            mobile_number="9876543213",
            password_hash=password_hash,
            role="officer",
            department_id=departments["HEALTH"].id,
        )
        db.add(officer2)

        db.flush()

        # --- Sample Grievances ---
        now = datetime.now(timezone.utc)

        # Grievance 1: Submitted
        g1 = Grievance(
            reference_number="GRV-2026-A1B2C3",
            citizen_id=citizen.id,
            district="Thiruvananthapuram",
            category="Road Maintenance",
            subject="Pothole on MG Road causing accidents",
            description="There is a large pothole on MG Road near the junction that has been causing accidents for the past two weeks. Multiple two-wheeler riders have fallen. Immediate repair is needed.",
            status="Submitted",
            priority="High",
            ai_summary="Citizen reports dangerous pothole on MG Road causing accidents.",
            ai_reason="Road damage with safety risks requires immediate attention from Public Works.",
            ai_confidence=0.90,
            ai_department_id=departments["PWD"].id,
            due_at=now + timedelta(days=15),
        )
        db.add(g1)
        db.flush()
        db.add(GrievanceHistory(
            grievance_id=g1.id, previous_status=None, new_status="Submitted",
            changed_by=citizen.id, remarks="Grievance submitted by citizen",
        ))

        # Grievance 2: Under Review (assigned)
        g2 = Grievance(
            reference_number="GRV-2026-D4E5F6",
            citizen_id=citizen.id,
            district="Ernakulam",
            category="Hospital Services",
            subject="Long waiting times at General Hospital",
            description="The waiting time at Ernakulam General Hospital OPD has become unbearable. Patients are waiting 4-5 hours even for basic consultations. More doctors are needed.",
            status="Under Review",
            priority="Medium",
            ai_summary="Citizen complains about excessive OPD waiting times at General Hospital.",
            ai_reason="Hospital service complaint related to staffing and patient management.",
            ai_confidence=0.85,
            ai_department_id=departments["HEALTH"].id,
            assigned_department_id=departments["HEALTH"].id,
            due_at=now + timedelta(days=10),
        )
        db.add(g2)
        db.flush()
        db.add(GrievanceHistory(
            grievance_id=g2.id, previous_status=None, new_status="Submitted",
            changed_by=citizen.id, remarks="Grievance submitted by citizen",
        ))
        db.add(GrievanceHistory(
            grievance_id=g2.id, previous_status="Submitted", new_status="Under Review",
            changed_by=cmo_admin.id, remarks="Assigned to Health Department",
        ))
        # Assignment
        a2 = DepartmentAssignment(
            grievance_id=g2.id,
            department_id=departments["HEALTH"].id,
            officer_id=officer2.id,
            assigned_by=cmo_admin.id,
            assignment_remarks="Please investigate the staffing situation",
            is_active=True,
        )
        db.add(a2)

        # Grievance 3: In Progress
        g3 = Grievance(
            reference_number="GRV-2026-G7H8I9",
            citizen_id=citizen.id,
            district="Kozhikode",
            category="Water Supply",
            subject="No water supply for 3 days in Nadakkavu area",
            description="Our area has not had water supply for the past 3 days. Multiple complaints to the local water authority have not been addressed.",
            status="In Progress",
            priority="High",
            assigned_department_id=departments["WATER"].id,
            due_at=now + timedelta(days=5),
        )
        db.add(g3)
        db.flush()
        db.add(GrievanceHistory(
            grievance_id=g3.id, previous_status=None, new_status="Submitted",
            changed_by=citizen.id, remarks="Grievance submitted by citizen",
        ))
        db.add(GrievanceHistory(
            grievance_id=g3.id, previous_status="Submitted", new_status="Under Review",
            changed_by=cmo_admin.id, remarks="Forwarded to Water Resources Department",
        ))
        db.add(GrievanceHistory(
            grievance_id=g3.id, previous_status="Under Review", new_status="In Progress",
            changed_by=cmo_admin.id, remarks="Officer is investigating the issue",
        ))

        # Grievance 4: Resolved
        g4 = Grievance(
            reference_number="GRV-2026-J1K2L3",
            citizen_id=citizen.id,
            district="Thrissur",
            category="School Infrastructure",
            subject="Leaking roof at Government School",
            description="The roof of the main building at Government Higher Secondary School is leaking badly during monsoon. Students and teachers are affected.",
            status="Resolved",
            priority="Medium",
            assigned_department_id=departments["EDU"].id,
            due_at=now - timedelta(days=2),
            feedback_rating=4,
            feedback_comments="The roof was repaired within a week. Thank you!",
            feedback_at=now - timedelta(days=1),
        )
        db.add(g4)
        db.flush()
        db.add(GrievanceHistory(
            grievance_id=g4.id, previous_status=None, new_status="Submitted",
            changed_by=citizen.id, remarks="Grievance submitted by citizen",
        ))
        db.add(GrievanceHistory(
            grievance_id=g4.id, previous_status="Submitted", new_status="Resolved",
            changed_by=cmo_admin.id, remarks="Roof repair completed successfully",
        ))

        # Grievance 5: Reopened
        g5 = Grievance(
            reference_number="GRV-2026-M4N5O6",
            citizen_id=citizen.id,
            district="Kollam",
            category="Street Lighting",
            subject="Broken street lights on Beach Road",
            description="Multiple street lights on Beach Road have been broken for over a month. The area is very dark at night and unsafe for pedestrians.",
            status="Reopened",
            priority="Medium",
            assigned_department_id=departments["PWD"].id,
            due_at=now + timedelta(days=7),
        )
        db.add(g5)
        db.flush()
        db.add(GrievanceHistory(
            grievance_id=g5.id, previous_status=None, new_status="Submitted",
            changed_by=citizen.id, remarks="Grievance submitted by citizen",
        ))
        db.add(GrievanceHistory(
            grievance_id=g5.id, previous_status="Submitted", new_status="Resolved",
            changed_by=cmo_admin.id, remarks="Street lights repaired",
        ))
        db.add(GrievanceHistory(
            grievance_id=g5.id, previous_status="Resolved", new_status="Reopened",
            changed_by=citizen.id, remarks="Grievance reopened by citizen - lights broken again",
        ))

        db.commit()
        print("Database seeded successfully!")
        print("\nDemo Credentials:")
        print("  Citizen:  citizen@demo.com / Demo@123")
        print("  CMO Admin: cmo@demo.com / Demo@123")
        print("  Officer 1: officer@demo.com / Demo@123 (Public Works)")
        print("  Officer 2: officer2@demo.com / Demo@123 (Health)")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()

