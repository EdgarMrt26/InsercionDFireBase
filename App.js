import React from "react";
import Productos from "./src/views/Productos";  // ← Comentado
//import Promedio from "./src/views/Promedio";       // ← Ahora usamos Promedio
import Clientes from "./src/views/Clientes";

export default function App() {
  return (
    <>
      {/* <Promedio /> */}  
      {/*<Productos /> */}
      <Clientes />
    </>
  );
}
