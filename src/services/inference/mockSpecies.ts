export interface Species {
  id: string
  commonName: string
  scientificName: string
}

/** Catálogo ficticio de ejemplo. Se reemplaza por las clases reales del modelo (configuracion_modelo.json). */
export const SPECIES: Species[] = [
  { id: 'ara-ararauna', commonName: 'Paraba azul y amarilla', scientificName: 'Ara ararauna' },
  { id: 'ara-chloropterus', commonName: 'Paraba roja', scientificName: 'Ara chloropterus' },
  { id: 'ramphastos-toco', commonName: 'Tucán toco', scientificName: 'Ramphastos toco' },
  { id: 'rupicola-peruvianus', commonName: 'Gallito de las rocas', scientificName: 'Rupicola peruvianus' },
  { id: 'phoenicopterus-chilensis', commonName: 'Flamenco chileno', scientificName: 'Phoenicopterus chilensis' },
  { id: 'cacicus-cela', commonName: 'Cacique lomiamarillo', scientificName: 'Cacicus cela' },
  { id: 'zonotrichia-capensis', commonName: 'Chingolo', scientificName: 'Zonotrichia capensis' },
  { id: 'turdus-rufiventris', commonName: 'Zorzal de vientre rojizo', scientificName: 'Turdus rufiventris' },
]
