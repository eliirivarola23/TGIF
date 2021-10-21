let url = document.title.includes('Senate') ? 'senate' : 'house'

let init = {
  headers: {
    'X-API-Key': 'YmvBsSZzgehJpiF9qPrVRNmkH1EIIQOqSqF7IJX7'
  }
}

fetch(`https://api.propublica.org/congress/v1/113/${url}/members.json`, init)
  .then(response => response.json())
  .then(json => {
    let base_Datos = [...json.results[0].members]
    cargarDatos(base_Datos)
  })
  .catch(error => {
    console.log(error.message)
  })


const cargarDatos = ((base_Datos) => {
  var members = base_Datos

  if (document.title.includes("TGIF - Home")) {

    document.getElementById('boton').addEventListener('click', (e) => {
      boton.innerText = boton.innerText == "Read More" ? "Read Less" : "Read More"
    })

  } else {
    if (document.title.includes("TGIF | Congress 113 -House") || document.title == "TGIF | Congress 113 -Senate") {

      var nombresAMostrar = []
      var filtroEstado = "Todos"
      var filtroParty = ["D", "ID", "R"]
      var partidosFinales = []

      function leerFiltros() {
        if (filtroEstado === "Todos") {
          nombresAMostrar = members
        } else {
          nombresAMostrar = members.filter(member => member.state === filtroEstado)
        }
        partidosFinales = []
        nombresAMostrar.forEach(member => { //itero nombresAMostrar porque en este array se encuentran los datos que ya fueron filtrados arriba
          let party = member.party
          if (party === "D" && filtroParty.includes("D")) {
            partidosFinales.push(member)
          } else if (party === "ID" && filtroParty.includes("ID")) {
            partidosFinales.push(member)
          } else if (party === "R" && filtroParty.includes("R")) {
            partidosFinales.push(member)
          }
        })
      }



      function pintarTabla() {
        document.getElementById("table-senate").innerHTML = ""
        leerFiltros()
        partidosFinales.forEach((member) => {
          let names = `${member.last_name} ${member.first_name} ${member.middle_name || ""}`
          let elementName = document.createElement("td")
          elementName.innerHTML = names.link(member.url)
          var elementParty = document.createElement("td")
          let elementState = document.createElement("td")
          let elementSeniority = document.createElement("td")
          let elementVotes = document.createElement("td")
          let elementFile = document.createElement("tr")
          elementParty.innerText = member.party
          elementState.innerText = member.state
          elementVotes.innerText = `${Math.ceil(member.votes_with_party_pct)} %`
          elementSeniority.innerText = member.seniority
          elementFile.appendChild(elementName)
          elementFile.appendChild(elementParty)
          elementFile.appendChild(elementState)
          elementFile.appendChild(elementSeniority)
          elementFile.appendChild(elementVotes)
          document.getElementById("table-senate").appendChild(elementFile)
        })
      }



      pintarTabla()


      // PINTADO DEL SELECT EN STATE 
      let opciones = [];
      members.filter(member => {
        if (!opciones.includes(member.state)) {
          return opciones.push(member.state)
        }
      })
      opciones.sort()
      opciones.forEach(state => {
        let elementOption = document.createElement("option")
        elementOption.innerText = state
        select.appendChild(elementOption)
      })



      //EVENTO DEL SELECT
      document.getElementById("select").addEventListener("change", (e) => {
        let seleccionado = e.target.value
        filtroEstado = seleccionado
        pintarTabla()
      })

      // EVENTO DEL CHECKBOX
      let checkbox = document.getElementsByName("tipo")
      checkbox = Array.from(checkbox)

      checkbox.forEach((chek) => {
        chek.addEventListener("change", (e) => {
          let queCheck = e.target.value //
          let estaChequeado = e.target.checked
          if (filtroParty.includes(queCheck) && !estaChequeado) {
            filtroParty = filtroParty.filter(party => party !== queCheck)
          } else if (!filtroParty.includes(queCheck) && estaChequeado) {
            filtroParty.push(queCheck)
          }
          pintarTabla()
        })
      })
    } else {

      // ESTADISTICA

      let estadisticas = {
        democratas: [],
        republicanos: [],
        independientes: [],
        masLeales: [], //MAS VOTOS CON SU PARTIDO MOST LOYAL  
        menosLeales: [], //MENOS VOTOS CON SU PARTIDO LEAST LOYAL ATT
        masComprometidos: [], //MENOS VOTOS PERDIDOS  MOST ENGAGED
        menosComprometidos: [], //MAS VOTOS PERDIDOS  LEAST ENGAGED
        votosPerdidos_Rep: [],
        totalPerdidos_Dem: [],
        votosConParty_Dem: 0,
        votosConParty_Rep: 0,
        votosConParty_Id: 0,
        votosPerdidos_Id: 0,
        totalDemocratas: 0, // Cant total
        totalRepublicanos: 0,
        totalIndependientes: 0,
        miembrosTotales: members.length,


      }
      // FILTRAR MIEMBROS DE CADA PARTIDO
      estadisticas.democratas = members.filter(member => member.party === "D")
      estadisticas.republicanos = members.filter(member => member.party === "R")
      estadisticas.independientes = members.filter(member => member.party === "ID")

      //CANTIDAD TOTAL DE MIEMBROS
      estadisticas.totalDemocratas = estadisticas.democratas.length // total de democratas
      estadisticas.totalRepublicanos = estadisticas.republicanos.length // total de republicanos
      estadisticas.totalIndependientes = estadisticas.independientes.length // total de Id.

      //arrayNuevo Votos perdidos Dem.
      let votos_Per_Dem = []
      let votos_Per_Rep = []
      let votos_Per_Id = []
      let votos_Party_Dem = []
      let votos_Party_Rep = []
      let votos_Party_Id = []



      // FILTRAR VOTOS PERDIDOS DE CADA PARTIDO // 
      function sacarPorcentaje(partido, arrayNuevo, propiedadASacar, totalPerdidos, totalPartido) {
        estadisticas[partido].forEach(member => {
          arrayNuevo.push(member[propiedadASacar])
        })
        estadisticas[totalPerdidos] = arrayNuevo.reduce((total, numero) => total + numero / estadisticas[totalPartido], 0)
        estadisticas[totalPerdidos] = Math.ceil(estadisticas[totalPerdidos])
        return estadisticas[totalPerdidos]
      }
      // LLAMO A LAS FUNCIONES PARA QUE pushee cada voto y lo sume.
      sacarPorcentaje("democratas", votos_Per_Dem, "missed_votes_pct", "totalPerdidos_Dem", "totalDemocratas")
      sacarPorcentaje("republicanos", votos_Per_Rep, "missed_votes_pct", "totalPerdidos_Rep", "totalRepublicanos")
      sacarPorcentaje("independientes", votos_Per_Id, "missed_votes_pct", "totalPerdidos_Id", "totalIndependientes")
      sacarPorcentaje("democratas", votos_Party_Dem, "votes_with_party_pct", "votosConParty_Dem", "totalDemocratas")
      sacarPorcentaje("republicanos", votos_Party_Rep, "votes_with_party_pct", "votosConParty_Rep", "totalRepublicanos")
      sacarPorcentaje("independientes", votos_Party_Id, "votes_with_party_pct", "votosConParty_Id", "totalIndependientes")



      //PARTY 
      //MAS LEALES
      var porcentaje = Math.ceil(estadisticas.miembrosTotales * 0.1) //porcentaje del 10%
      var miembrosMasLeales = members.filter(member => member.total_votes !== 0).sort((a, b) => b.votes_with_party_pct - a.votes_with_party_pct)
      estadisticas.masLeales = miembrosMasLeales.slice(0, porcentaje)

      // MENOS LEALES
      var miembrosMenosLeales = members.filter(member => member.total_votes !== 0).sort((a, b) => a.votes_with_party_pct - b.votes_with_party_pct)
      estadisticas.menosLeales = miembrosMenosLeales.slice(0, porcentaje)


      //ATTENDANCE 
      //MENOS COMPROMETIDOS LEAST ENGAGED

      var miembrosMenosComp = members.filter(member => member.total_votes !== 0).sort((a, b) => b.missed_votes_pct - a.missed_votes_pct)
      estadisticas.menosComprometidos = miembrosMenosComp.slice(0, porcentaje) //Si tiene 0 no me lo guardes en el nuevo filtro, sino tiene 0, guardalo


      //MAS COMPROMETIDOS MOST ENGAGED ATTENDANCE
      var miembrosMasComp = members.filter(member => member.total_votes !== 0).sort((a, b) => a.missed_votes_pct - b.missed_votes_pct)
      estadisticas.masComprometidos = miembrosMasComp.slice(0, porcentaje)



      // FUNCION PINTAR TABLA  
      function pintarTablaArriba(propiedad, nombre, votos) {
        let total = document.createElement("td")
        let partido = document.createElement("td")
        partido.innerText = nombre
        total.innerText = estadisticas[propiedad] || "-"
        let totalPerdidos = document.createElement("td")
        totalPerdidos.innerText = votos
        let filas = document.createElement("tr")
        filas.appendChild(partido)
        filas.appendChild(total)
        filas.appendChild(totalPerdidos)
        document.getElementById("table_AH").appendChild(filas)
      }


      function pintarTablaAbajo(propiedad, padre) {
        estadisticas[propiedad].forEach(member => {
          let names = `${member.last_name} ${member.first_name} ${member.middle_name || ""}`
          let elementName = document.createElement("td")
          elementName.innerHTML = names.link(member.url)
          let votos = document.createElement("td")
          let porcentajeDeVotos = document.createElement("td")
          if (document.title.includes("Loyalty")) {
            votos.innerText = Math.ceil((member.total_votes - member.missed_votes) * member.votes_with_party_pct / 100) // numero de votos / Party
            porcentajeDeVotos.innerText = `${Math.ceil(member.votes_with_party_pct)} %` //mas o menos leal / party /
          } else {
            votos.innerText = `${Math.ceil(member.missed_votes)}` // numero de votos perdidos / attendance
            porcentajeDeVotos.innerText = `${Math.ceil(member.missed_votes_pct)} %` //mas|menos comprometidos / Attendance /
          }
          let filas = document.createElement("tr")
          filas.appendChild(elementName)
          filas.appendChild(votos)
          filas.appendChild(porcentajeDeVotos)
          document.getElementById(padre).appendChild(filas)
        })
      }

      if (document.title == "TGIF | Attendance - Senate" || document.title == "TGIF | Attendance - House") {
        pintarTablaArriba("totalDemocratas", "Democrats", estadisticas.totalPerdidos_Dem + " %")
        pintarTablaArriba("totalRepublicanos", "Republicans", estadisticas.totalPerdidos_Rep + " %")
        pintarTablaArriba("totalIndependientes", "Independent", estadisticas.totalPerdidos_Id + " %")
        pintarTablaArriba("miembrosTotales", "Total", "-")
        pintarTablaAbajo("menosComprometidos", "t-body")
        pintarTablaAbajo("masComprometidos", "t-body2")

      } else {
        pintarTablaArriba("totalDemocratas", "Democrats", estadisticas.votosConParty_Dem + " %")
        pintarTablaArriba("totalRepublicanos", "Republicans", estadisticas.votosConParty_Rep + " %")
        pintarTablaArriba("totalIndependientes", "Independent", estadisticas.votosConParty_Id + " %")
        pintarTablaArriba("miembrosTotales", "Total", "-")
        pintarTablaAbajo("menosLeales", "t-body")
        pintarTablaAbajo("masLeales", "t-body2")

      }


    }

  }
})