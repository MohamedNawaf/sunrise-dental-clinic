package model;

public class Patient {
    // Private attributes to achieve Encapsulation
    private int patientId;
    private String fullName;
    private String address;
    private String contactNumber;
    private String email;

    // Constructor
    public Patient(int patientId, String fullName, String address, String contactNumber, String email) {
        this.patientId = patientId;
        this.fullName = fullName;
        this.address = address;
        this.contactNumber = contactNumber;
        this.email = email;
    }

    // Public Getters
    public int getPatientId() { return patientId; }
    public String getFullName() { return fullName; }
    public String getAddress() { return address; }
    public String getContactNumber() { return contactNumber; }
    public String getEmail() { return email; }

    // Public Setters
    public void setPatientId(int patientId) { this.patientId = patientId; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setAddress(String address) { this.address = address; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public void setEmail(String email) { this.email = email; }
}