package servlet;

import dao.BillingDAO;
import model.BillDTO;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;

@WebServlet("/api/billing")
public class BillingServlet extends HttpServlet {

    private BillingDAO billingDAO = new BillingDAO();
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
        JsonObject requestData = gson.fromJson(reader, JsonObject.class);
        String aptNumber = requestData.get("appointmentNumber").getAsString();

        BillDTO bill = billingDAO.generateBill(aptNumber);

        if (bill.success) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(gson.toJson(bill));
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"" + bill.message + "\"}");
        }
    }
}