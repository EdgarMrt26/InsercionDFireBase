import React, {useEffect, useState} from 'react'
import { View, Text, TextInput, Button, StyleSheet } from 'react-native'

import { ref, set, push, onValue } from "firebase/database"
import { realtimeDB } from '../database/firebaseconfig'

const CalculoIMC = () => {
  const [nombre, setNombre] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [registrosIMC, setRegistrosIMC] = useState([]);

  const guardarEnRT = async () => {
    if (!nombre || !altura || !peso) {
      alert("Rellena todos los campos");
      return;
    }

    const alturaNum = parseFloat(altura);
    const pesoNum = parseFloat(peso);
    if (isNaN(alturaNum) || isNaN(pesoNum) || alturaNum <= 0 || pesoNum <= 0) {
      alert("Ingresa valores numéricos válidos para altura y peso");
      return;
    }

    const imc = pesoNum / (alturaNum * alturaNum);

    try {
      const referencia = ref(realtimeDB, "imc_registros");
      const nuevoRef = push(referencia); // crea ID automático

      await set(nuevoRef, {
        nombre,
        altura: alturaNum,
        peso: pesoNum,
        imc: imc.toFixed(2),
      });

      setNombre("");
      setAltura("");
      setPeso("");

      alert("Cálculo de IMC guardado en Realtime");
    } catch (error) {
      console.log("Error al guardar:", error);
    }
  };

  const leerRT = () => {
    const referencia = ref(realtimeDB, "imc_registros");

    onValue(referencia, (snapshot) => {
      if (snapshot.exists()) {
        // snapshot.val() devuelve un objeto {id: {data}}
        const dataObj = snapshot.val();

        // convertir ese objeto en un array limpio
        const lista = Object.entries(dataObj).map(([id, datos]) => ({
          id,
          ...datos,
        }));

        setRegistrosIMC(lista);
      } else {
        setRegistrosIMC([]);
      }
    });
  };

  useEffect(() => {
    leerRT();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cálculo de IMC</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la persona"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Altura (en metros, ej: 1.75)"
        keyboardType="numeric"
        value={altura}
        onChangeText={setAltura}
      />

      <TextInput
        style={styles.input}
        placeholder="Peso (en kg, ej: 70)"
        keyboardType="numeric"
        value={peso}
        onChangeText={setPeso}
      />

      <Button title="Calcular y Guardar IMC" onPress={guardarEnRT} />

      <Text style={styles.subtitulo}>Registros de IMC:</Text>

      {registrosIMC.length === 0 ? (
        <Text>No hay registros</Text>
      ) : (
        registrosIMC.map((r) => (
          <Text key={r.id}>
            {r.nombre} - Altura: {r.altura} m, Peso: {r.peso} kg, IMC: {r.imc}
          </Text>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  subtitulo: { fontSize: 18, marginTop: 20, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default CalculoIMC;