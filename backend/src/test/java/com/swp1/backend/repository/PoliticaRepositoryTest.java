package com.swp1.backend.repository;

import com.swp1.backend.model.Flujo;
import com.swp1.backend.model.Nodo;
import com.swp1.backend.model.PoliticaNegocio;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class PoliticaRepositoryTest {

    @Autowired
    private PoliticaRepository politicaRepository;

    @Test
    public void testPersistirYRecuperarPolitica() {
        // 1. Crear Nodos
        Nodo inicio = new Nodo();
        inicio.setId("n1");
        inicio.setNombre("Inicio Proceso");
        inicio.setTipo(Nodo.TipoNodo.INICIO);
        inicio.setPosicion(new Nodo.Posicion(100, 100));

        Nodo actividad = new Nodo();
        actividad.setId("n2");
        actividad.setNombre("Revisar Documentación");
        actividad.setTipo(Nodo.TipoNodo.ACTIVIDAD);
        actividad.setDepartamentoId("dept-legal");
        actividad.setPosicion(new Nodo.Posicion(300, 100));

        // 2. Crear Flujo
        Flujo f1 = new Flujo();
        f1.setId("f1");
        f1.setOrigenId("n1");
        f1.setDestinoId("n2");
        f1.setCondicion("DEFAULT");

        // 3. Crear Política
        PoliticaNegocio politica = new PoliticaNegocio("Politica de Prueba", "Descripción de prueba");
        politica.setNodos(Arrays.asList(inicio, actividad));
        politica.setFlujos(Arrays.asList(f1));

        // 4. Persistir
        PoliticaNegocio guardada = politicaRepository.save(politica);
        assertThat(guardada.getId()).isNotNull();

        // 5. Recuperar
        Optional<PoliticaNegocio> recuperadaOpt = politicaRepository.findById(guardada.getId());
        assertThat(recuperadaOpt).isPresent();
        
        PoliticaNegocio recuperada = recuperadaOpt.get();
        assertThat(recuperada.getNombre()).isEqualTo("Politica de Prueba");
        assertThat(recuperada.getNodos()).hasSize(2);
        assertThat(recuperada.getFlujos()).hasSize(1);
        assertThat(recuperada.getFlujos().get(0).getOrigenId()).isEqualTo("n1");
    }
}
