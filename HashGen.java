import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class HashGen {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("Admin@123    : " + encoder.encode("Admin@123"));
        System.out.println("Recruiter@123: " + encoder.encode("Recruiter@123"));
        System.out.println("Candidate@123: " + encoder.encode("Candidate@123"));
    }
}
