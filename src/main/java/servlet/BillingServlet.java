package servlet;

import dao.BillingDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/billing")
public class BillingServlet extends HttpServlet {

    private BillingDAO billingDAO = new BillingDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");

        // URL eken appointment number eka ganeema (e.g., ?aptNo=APT-2026-0001)
        String aptNo = request.getParameter("aptNo");

        if (aptNo != null) {
            String invoiceNumber = billingDAO.generateBill(aptNo);

            if (invoiceNumber != null) {
                response.getWriter().write("{\"invoice\": \"" + invoiceNumber + "\", \"status\": \"Success\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\": \"Error generating bill or appointment not found\"}");
            }
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Appointment Number is required\"}");
        }
    }
}