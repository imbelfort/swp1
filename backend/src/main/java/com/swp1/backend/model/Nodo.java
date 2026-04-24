package com.swp1.backend.model;

public class Nodo {
    private String id;
    private String tipo; // START, ACTIVITY, DECISION, END
    private String nombre;
    private String departamentoId;
    private double x; // Para posicionamiento en el diseñador
    private double y;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDepartamentoId() { return departamentoId; }
    public void setDepartamentoId(String departamentoId) { this.departamentoId = departamentoId; }
    public double getX() { return x; }
    public void setX(double x) { this.x = x; }
    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
}
