package model;

public class Appointment {
    private int appointmentId;
    private String appointmentNumber;
    private int patientId;
    private int dentistId;
    private int treatmentId;
    private String appointmentDate;
    private String appointmentTime;
    private String status;

    public Appointment(int appointmentId, String appointmentNumber, int patientId, int dentistId, int treatmentId, String appointmentDate, String appointmentTime, String status) {
        this.appointmentId = appointmentId;
        this.appointmentNumber = appointmentNumber;
        this.patientId = patientId;
        this.dentistId = dentistId;
        this.treatmentId = treatmentId;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.status = status;
    }

    // Getters
    public int getAppointmentId() { return appointmentId; }
    public String getAppointmentNumber() { return appointmentNumber; }
    public int getPatientId() { return patientId; }
    public int getDentistId() { return dentistId; }
    public int getTreatmentId() { return treatmentId; }
    public String getAppointmentDate() { return appointmentDate; }
    public String getAppointmentTime() { return appointmentTime; }
    public String getStatus() { return status; }
}