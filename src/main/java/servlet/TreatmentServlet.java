package servlet;

import dao.TreatmentDAO;
import model.TreatmentDTO;
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/treatments")
public class TreatmentServlet extends HttpServlet {

    private TreatmentDAO treatmentDAO = new TreatmentDAO();
    private Gson gson = new Gson();

    private void setAccessControlHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        setAccessControlHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        setAccessControlHeaders(response);
        response.setContentType("application/json");
        List<TreatmentDTO> treatments = treatmentDAO.getAllTreatments();
        response.getWriter().write(gson.toJson(treatments));
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        setAccessControlHeaders(response);
        response.setContentType("application/json");
        TreatmentDTO newTreatment = gson.fromJson(request.getReader(), TreatmentDTO.class);
        if (treatmentDAO.addTreatment(newTreatment)) {
            response.setStatus(HttpServletResponse.SC_CREATED);
            response.getWriter().write("{\"message\": \"Treatment added\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        setAccessControlHeaders(response);
        response.setContentType("application/json");
        TreatmentDTO updateData = gson.fromJson(request.getReader(), TreatmentDTO.class);
        if (treatmentDAO.updateTreatment(updateData)) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"message\": \"Treatment updated\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        setAccessControlHeaders(response);
        int id = Integer.parseInt(request.getParameter("id"));
        if (treatmentDAO.deleteTreatment(id)) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"message\": \"Treatment removed\"}");
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}