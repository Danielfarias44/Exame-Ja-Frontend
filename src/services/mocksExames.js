// Catálogo de exames de exemplo para o filtro "Tipo de exame".
// - Cada exame tem um id estável. É o id que vai para a URL da busca.
//   Quando a tici terminar o backend, eu pego os códigos TUSS, troco os ids por eles

const compararNomes = (a, b) => a.nome.localeCompare(b.nome, "pt-BR");

const categoriasBase = [
  {
    id: "laboratoriais",
    nome: "Exames laboratoriais",
    exames: [
      { id: "hemograma-completo", nome: "Hemograma Completo" },
      { id: "glicemia-em-jejum", nome: "Glicemia em Jejum" },
      { id: "hemoglobina-glicada", nome: "Hemoglobina Glicada" },
      { id: "colesterol-total-e-fracoes", nome: "Colesterol Total e Frações" },
      { id: "triglicerideos", nome: "Triglicerídeos" },
      { id: "ureia-e-creatinina", nome: "Ureia e Creatinina" },
      { id: "tgo-e-tgp-funcao-hepatica", nome: "TGO e TGP (Função Hepática)" },
      { id: "tsh-e-t4-livre", nome: "TSH e T4 Livre" },
      { id: "vitamina-d-25-hidroxi", nome: "Vitamina D (25-Hidroxi)" },
      { id: "vitamina-b12", nome: "Vitamina B12" },
      { id: "ferritina", nome: "Ferritina" },
      { id: "ferro-serico", nome: "Ferro Sérico" },
      { id: "acido-urico", nome: "Ácido Úrico" },
      { id: "pcr-proteina-c-reativa", nome: "PCR (Proteína C Reativa)" },
      { id: "vhs", nome: "VHS" },
      { id: "coagulograma-completo", nome: "Coagulograma Completo" },
      { id: "psa-total-e-livre", nome: "PSA Total e Livre" },
      { id: "beta-hcg", nome: "Beta HCG" },
      { id: "eas-urina-tipo-1", nome: "EAS (Urina Tipo 1)" },
      { id: "urocultura", nome: "Urocultura" },
      { id: "parasitologico-de-fezes", nome: "Parasitológico de Fezes" },
      { id: "sorologia-para-hiv", nome: "Sorologia para HIV" },
      { id: "sorologia-para-hepatite-b-e-c", nome: "Sorologia para Hepatite B e C" },
      { id: "vdrl-sifilis", nome: "VDRL (Sífilis)" },
      { id: "tipagem-sanguinea-e-fator-rh", nome: "Tipagem Sanguínea e Fator Rh" },
      { id: "curva-glicemica", nome: "Curva Glicêmica" },
      { id: "insulina-basal", nome: "Insulina Basal" },
      { id: "cortisol-basal", nome: "Cortisol Basal" },
      { id: "testosterona-total-e-livre", nome: "Testosterona Total e Livre" },
      { id: "estradiol", nome: "Estradiol" },
      { id: "progesterona", nome: "Progesterona" },
    ],
  },
  {
    id: "imagem",
    nome: "Imagem e radiologia",
    exames: [
      { id: "raio-x-de-torax", nome: "Raio-X de Tórax" },
      { id: "raio-x-de-coluna-lombar", nome: "Raio-X de Coluna Lombar" },
      { id: "raio-x-de-joelho", nome: "Raio-X de Joelho" },
      { id: "ultrassonografia-abdominal-total", nome: "Ultrassonografia Abdominal Total" },
      { id: "ultrassonografia-pelvica", nome: "Ultrassonografia Pélvica" },
      { id: "ultrassonografia-transvaginal", nome: "Ultrassonografia Transvaginal" },
      { id: "ultrassonografia-de-tireoide", nome: "Ultrassonografia de Tireoide" },
      { id: "ultrassonografia-obstetrica", nome: "Ultrassonografia Obstétrica" },
      { id: "ultrassonografia-de-mamas", nome: "Ultrassonografia de Mamas" },
      { id: "ultrassonografia-de-partes-moles", nome: "Ultrassonografia de Partes Moles" },
      { id: "doppler-de-carotidas", nome: "Doppler de Carótidas" },
      { id: "doppler-venoso-de-membros-inferiores", nome: "Doppler Venoso de Membros Inferiores" },
      { id: "tomografia-computadorizada-de-cranio", nome: "Tomografia Computadorizada de Crânio" },
      { id: "tomografia-computadorizada-de-torax", nome: "Tomografia Computadorizada de Tórax" },
      { id: "tomografia-computadorizada-de-abdomen", nome: "Tomografia Computadorizada de Abdômen" },
      { id: "ressonancia-magnetica-de-cranio", nome: "Ressonância Magnética de Crânio" },
      { id: "ressonancia-magnetica-de-coluna", nome: "Ressonância Magnética de Coluna" },
      { id: "ressonancia-magnetica-de-joelho", nome: "Ressonância Magnética de Joelho" },
      { id: "ressonancia-magnetica-de-ombro", nome: "Ressonância Magnética de Ombro" },
      { id: "mamografia-digital", nome: "Mamografia Digital" },
      { id: "densitometria-ossea", nome: "Densitometria Óssea" },
    ],
  },
  {
    id: "cardiologicos",
    nome: "Exames cardiológicos",
    exames: [
      { id: "eletrocardiograma-ecg", nome: "Eletrocardiograma (ECG)" },
      { id: "ecocardiograma-transtoracico", nome: "Ecocardiograma Transtorácico" },
      { id: "teste-ergometrico-esteira", nome: "Teste Ergométrico (Esteira)" },
      { id: "holter-24-horas", nome: "Holter 24 Horas" },
      { id: "mapa-24-horas", nome: "MAPA 24 Horas" },
      { id: "cintilografia-do-miocardio", nome: "Cintilografia do Miocárdio" },
    ],
  },
  {
    id: "digestivos",
    nome: "Endoscopia e digestivos",
    exames: [
      { id: "endoscopia-digestiva-alta", nome: "Endoscopia Digestiva Alta" },
      { id: "colonoscopia", nome: "Colonoscopia" },
      { id: "teste-respiratorio-para-h-pylori", nome: "Teste Respiratório para H. Pylori" },
    ],
  },
  {
    id: "neuro-respiratorios",
    nome: "Neurológicos e respiratórios",
    exames: [
      { id: "eletroencefalograma-eeg", nome: "Eletroencefalograma (EEG)" },
      { id: "eletroneuromiografia", nome: "Eletroneuromiografia" },
      { id: "polissonografia", nome: "Polissonografia" },
      { id: "espirometria-prova-de-funcao-pulmonar", nome: "Espirometria (Prova de Função Pulmonar)" },
    ],
  },
  {
    id: "mulher-urologia",
    nome: "Mulher e urologia",
    exames: [
      { id: "papanicolau-preventivo", nome: "Papanicolau (Preventivo)" },
      { id: "colposcopia", nome: "Colposcopia" },
      { id: "urodinamica-completa", nome: "Urodinâmica Completa" },
    ],
  },
  {
    id: "olhos-ouvidos",
    nome: "Olhos e ouvidos",
    exames: [
      { id: "audiometria-tonal-e-vocal", nome: "Audiometria Tonal e Vocal" },
      { id: "impedanciometria", nome: "Impedanciometria" },
      { id: "mapeamento-de-retina", nome: "Mapeamento de Retina" },
      { id: "tonometria-ocular", nome: "Tonometria Ocular" },
      { id: "campimetria-visual", nome: "Campimetria Visual" },
      { id: "biometria-ultrassonica", nome: "Biometria Ultrassônica" },
    ],
  },
  {
    id: "outros",
    nome: "Outros",
    exames: [
      { id: "biopsia-de-pele", nome: "Biópsia de Pele" },
    ],
  },
];

// Categorias na ordem acima; exames de cada categoria em ordem alfabética.
export const exameCategorias = categoriasBase.map((categoria) => ({
  ...categoria,
  exames: [...categoria.exames].sort(compararNomes),
}));

// Lista simples com a categoria de cada exame (útil para buscar um exame pelo id).
export const exames = exameCategorias.flatMap((categoria) =>
  categoria.exames.map((exame) => ({
    ...exame,
    categoriaId: categoria.id,
    categoria: categoria.nome,
  }))
);

// Atalhos para o público que procura os exames mais comuns.
export const examesMaisProcurados = [
  "hemograma-completo",
  "glicemia-em-jejum",
  "raio-x-de-torax",
  "ultrassonografia-abdominal-total",
  "eletrocardiograma-ecg",
];

export function getExame(id) {
  return exames.find((exame) => exame.id === id) ?? null;
}
