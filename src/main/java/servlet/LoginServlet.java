package servlet;

import dao.UserDAO;
import model.UserDTO;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {

    private UserDAO userDAO = new UserDAO();
    private Gson gson = new Gson();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");

        BufferedReader reader = request.getReader();
        JsonObject loginData = gson.fromJson(reader, JsonObject.class);

        String username = loginData.get("username").getAsString();
        String password = loginData.get("password").getAsString();

        UserDTO user = userDAO.validateUser(username, password);

        if (user.isValid) {
            response.setStatus(HttpServletResponse.SC_OK);
            // Frontend ekata role ekath ekkama data yawima
            response.getWriter().write("{\"message\": \"Login successful\", \"role\": \"" + user.role + "\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Invalid credentials\"}");
        }
    }
}