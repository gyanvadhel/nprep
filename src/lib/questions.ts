export type Topic = "Anatomy" | "Blood" | "Respiration";
export type Question = {
  id: string;
  topic: Topic;
  title: string;
  options: string[];
  answer: number;
  explanation: string;
  source: string;
  sourceLabel: string;
};
const textbook = "https://openstax.org/books/anatomy-and-physiology-2e/pages/";
export const questions: Question[] = [
  {
    id: "a1",
    topic: "Anatomy",
    title:
      "In the standard anatomical position, which direction do the palms face?",
    options: ["Backward", "Forward", "Toward the thighs", "Toward each other"],
    answer: 1,
    explanation:
      "The palms face forward in the anatomical position. This shared reference makes descriptions of the body consistent.",
    source: textbook + "1-6-anatomical-terminology",
    sourceLabel: "OpenStax · Anatomical terminology",
  },
  {
    id: "a2",
    topic: "Anatomy",
    title:
      "Which anatomical plane divides the body into right and left portions?",
    options: ["Transverse", "Frontal", "Sagittal", "Oblique"],
    answer: 2,
    explanation:
      "A sagittal plane separates right and left portions. A frontal plane separates front and back; a transverse plane separates upper and lower portions.",
    source: textbook + "1-6-anatomical-terminology",
    sourceLabel: "OpenStax · Anatomical terminology",
  },
  {
    id: "a3",
    topic: "Anatomy",
    title:
      "The elbow is described as proximal to the wrist. What does proximal mean?",
    options: [
      "Closer to the surface",
      "Farther from the trunk",
      "Closer to the limb's attachment",
      "Toward the back",
    ],
    answer: 2,
    explanation:
      "Proximal means nearer the attachment of a limb to the trunk. Distal means farther from that attachment.",
    source: textbook + "1-6-anatomical-terminology",
    sourceLabel: "OpenStax · Anatomical terminology",
  },
  {
    id: "b1",
    topic: "Blood",
    title:
      "Which formed element of blood is primarily responsible for transporting oxygen?",
    options: ["Erythrocytes", "Leukocytes", "Platelets", "Plasma"],
    answer: 0,
    explanation:
      "Erythrocytes are red blood cells. Their haemoglobin carries oxygen. Leukocytes support defence, and platelets participate in clotting.",
    source: textbook + "18-1-an-overview-of-blood",
    sourceLabel: "OpenStax · An overview of blood",
  },
  {
    id: "b2",
    topic: "Blood",
    title: "What is the liquid component of blood called?",
    options: ["Haemoglobin", "Plasma", "Platelets", "Erythrocytes"],
    answer: 1,
    explanation:
      "Plasma is the fluid component in which blood cells and platelets are suspended. It carries dissolved substances around the body.",
    source: textbook + "18-1-an-overview-of-blood",
    sourceLabel: "OpenStax · An overview of blood",
  },
  {
    id: "b3",
    topic: "Blood",
    title:
      "Which blood component consists of cell fragments that participate in clotting?",
    options: ["Erythrocytes", "Albumin", "Platelets", "Lymphocytes"],
    answer: 2,
    explanation:
      "Platelets are cell fragments involved in haemostasis. They help form a plug at a damaged blood vessel.",
    source: textbook + "18-1-an-overview-of-blood",
    sourceLabel: "OpenStax · An overview of blood",
  },
  {
    id: "r1",
    topic: "Respiration",
    title: "Where does gas exchange primarily occur in the lungs?",
    options: ["Trachea", "Larynx", "Alveoli", "Main bronchi"],
    answer: 2,
    explanation:
      "Alveoli provide a thin surface next to pulmonary capillaries, allowing oxygen and carbon dioxide to diffuse between air and blood.",
    source: textbook + "22-1-organs-and-structures-of-the-respiratory-system",
    sourceLabel: "OpenStax · Respiratory structures",
  },
  {
    id: "r2",
    topic: "Respiration",
    title: "Which structure is commonly called the windpipe?",
    options: ["Oesophagus", "Trachea", "Pharynx", "Pleura"],
    answer: 1,
    explanation:
      "The trachea conducts air toward the bronchi. The oesophagus transports food, and the pleura surrounds the lungs.",
    source: textbook + "22-1-organs-and-structures-of-the-respiratory-system",
    sourceLabel: "OpenStax · Respiratory structures",
  },
  {
    id: "r3",
    topic: "Respiration",
    title: "The trachea divides into which pair of structures?",
    options: [
      "Alveolar ducts",
      "Pulmonary veins",
      "Primary bronchi",
      "Pleural cavities",
    ],
    answer: 2,
    explanation:
      "The trachea branches into the right and left primary bronchi, which conduct air into their respective lungs.",
    source: textbook + "22-1-organs-and-structures-of-the-respiratory-system",
    sourceLabel: "OpenStax · Respiratory structures",
  },
];
export const topics: {
  name: Topic;
  description: string;
  className: string;
  label: string;
}[] = [
  {
    name: "Anatomy",
    description: "Know the body. Build your foundation.",
    className: "peach",
    label: "THE FOUNDATIONS",
  },
  {
    name: "Blood",
    description: "A closer look at what keeps us going.",
    className: "rose",
    label: "THE ESSENTIALS",
  },
  {
    name: "Respiration",
    description: "Make every breath of learning count.",
    className: "blue",
    label: "BODY SYSTEMS",
  },
];
export const questionById = (id: string) => questions.find((q) => q.id === id);
