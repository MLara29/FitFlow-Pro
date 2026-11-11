import type { Exercise } from '../types'

// O design traz uma única mídia de demonstração; troque `mediaUrl` de cada
// exercício pela URL do GIF correspondente quando tiver os arquivos. Com o Supabase
// configurado, a lista abaixo é substituída pelo conteúdo da tabela `exercises`.
const DEMO = 'media/exercicio-demo.jpg'

const ex = (id: string, name: string, muscleGroup: string, equipment: string, instructions: string[]): Exercise => ({
  id,
  name,
  muscleGroup,
  equipment,
  instructions,
  mediaUrl: DEMO,
})

export const EXERCISES: Exercise[] = [
  // Peito
  ex('supino-reto', 'Supino reto com barra', 'Peito', 'Barra', [
    'Deite no banco com os pés firmes no chão e segure a barra um pouco além da largura dos ombros.',
    'Tire a barra do suporte e desça com controle até tocar o meio do peito.',
    'Empurre a barra para cima até estender os cotovelos, sem travar.',
    'Mantenha as escápulas juntas e os glúteos apoiados no banco.',
  ]),
  ex('supino-inclinado', 'Supino inclinado com halteres', 'Peito', 'Halteres', [
    'Ajuste o banco entre 30° e 45° e deite com um halter em cada mão na altura do peito.',
    'Empurre os halteres para cima até quase estender os cotovelos.',
    'Desça devagar até os halteres ficarem ao lado do peito.',
    'Mantenha os punhos alinhados com os cotovelos durante todo o movimento.',
  ]),
  ex('crucifixo', 'Crucifixo com halteres', 'Peito', 'Halteres', [
    'Deite no banco com os halteres acima do peito e as palmas voltadas uma para a outra.',
    'Abra os braços em arco, com os cotovelos levemente flexionados, até sentir alongar o peito.',
    'Volte pelo mesmo arco até os halteres quase se tocarem.',
    'Não deixe os cotovelos descerem muito abaixo da linha dos ombros.',
  ]),
  ex('crossover', 'Crossover na polia', 'Peito', 'Polia', [
    'Ajuste as polias no alto, segure uma alça em cada mão e dê um passo à frente.',
    'Com o tronco levemente inclinado, traga as mãos para baixo e para a frente até se encontrarem.',
    'Segure um instante contraindo o peito.',
    'Volte devagar, deixando os braços abrirem até a linha dos ombros.',
  ]),
  ex('flexao', 'Flexão de braço', 'Peito', 'Peso corporal', [
    'Apoie as mãos no chão um pouco além da largura dos ombros e estenda as pernas.',
    'Mantenha o corpo em linha reta, da cabeça aos calcanhares.',
    'Desça o peito até perto do chão, com os cotovelos a cerca de 45° do tronco.',
    'Empurre o chão até estender os braços.',
  ]),

  // Costas
  ex('barra-fixa', 'Barra fixa', 'Costas', 'Peso corporal', [
    'Segure a barra com as palmas para a frente, mãos um pouco além dos ombros.',
    'Partindo dos braços estendidos, puxe o corpo até o queixo passar da barra.',
    'Desça com controle até estender os braços de novo.',
    'Evite balançar o corpo para ganhar impulso.',
  ]),
  ex('puxada-frontal', 'Puxada frontal na polia', 'Costas', 'Polia', [
    'Sente no aparelho, ajuste o apoio das coxas e segure a barra com pegada aberta.',
    'Puxe a barra até a parte de cima do peito, levando os cotovelos para baixo e para trás.',
    'Volte devagar até estender os braços.',
    'Mantenha o tronco firme, com leve inclinação para trás.',
  ]),
  ex('remada-curvada', 'Remada curvada com barra', 'Costas', 'Barra', [
    'Em pé, segure a barra, flexione levemente os joelhos e incline o tronco à frente com a coluna reta.',
    'Puxe a barra em direção ao abdômen, levando os cotovelos para trás.',
    'Desça com controle até estender os braços.',
    'Não arredonde a lombar nem use impulso do tronco.',
  ]),
  ex('remada-unilateral', 'Remada unilateral com halter', 'Costas', 'Halter', [
    'Apoie um joelho e a mão do mesmo lado no banco, com a coluna reta.',
    'Com o outro braço, puxe o halter até a lateral do tronco.',
    'Desça devagar até estender o braço.',
    'Complete as repetições e troque de lado.',
  ]),
  ex('remada-baixa', 'Remada baixa na polia', 'Costas', 'Polia', [
    'Sente no aparelho com os pés apoiados e os joelhos levemente flexionados.',
    'Segure o puxador e puxe até o abdômen, aproximando as escápulas.',
    'Volte devagar até estender os braços.',
    'Mantenha o tronco ereto, sem balançar para trás.',
  ]),
  ex('levantamento-terra', 'Levantamento terra', 'Costas', 'Barra', [
    'Fique com os pés na largura do quadril e a barra sobre o meio dos pés.',
    'Agache, segure a barra e mantenha a coluna reta e o peito aberto.',
    'Levante estendendo quadril e joelhos ao mesmo tempo, com a barra rente ao corpo.',
    'Desça pelo mesmo caminho, com controle.',
  ]),

  // Ombros
  ex('desenvolvimento-halteres', 'Desenvolvimento com halteres', 'Ombros', 'Halteres', [
    'Sente com as costas apoiadas e um halter em cada mão na altura dos ombros.',
    'Empurre os halteres para cima até quase estender os cotovelos.',
    'Desça com controle até a altura das orelhas.',
    'Mantenha o abdômen firme e não arqueie a lombar.',
  ]),
  ex('desenvolvimento-militar', 'Desenvolvimento militar com barra', 'Ombros', 'Barra', [
    'Em pé, segure a barra na altura das clavículas, mãos um pouco além dos ombros.',
    'Empurre a barra acima da cabeça até estender os braços.',
    'Desça devagar até a posição inicial.',
    'Contraia abdômen e glúteos para não inclinar o tronco para trás.',
  ]),
  ex('elevacao-lateral', 'Elevação lateral', 'Ombros', 'Halteres', [
    'Em pé, um halter em cada mão ao lado do corpo.',
    'Eleve os braços para os lados até a altura dos ombros, com os cotovelos levemente flexionados.',
    'Desça devagar.',
    'Não encolha os ombros nem balance o tronco.',
  ]),
  ex('elevacao-frontal', 'Elevação frontal com halteres', 'Ombros', 'Halteres', [
    'Em pé, halteres à frente das coxas, palmas voltadas para o corpo.',
    'Eleve os braços à frente até a altura dos ombros.',
    'Desça com controle.',
    'Mantenha o tronco parado durante todo o movimento.',
  ]),
  ex('crucifixo-inverso', 'Crucifixo inverso', 'Ombros', 'Máquina', [
    'Sente de frente para o encosto da máquina e segure as alças com os braços estendidos.',
    'Abra os braços para trás até a linha dos ombros.',
    'Segure um instante, aproximando as escápulas.',
    'Volte devagar, sem deixar os pesos baterem.',
  ]),

  // Bíceps
  ex('rosca-direta', 'Rosca direta com barra', 'Bíceps', 'Barra', [
    'Em pé, segure a barra com as palmas para cima, mãos na largura dos ombros.',
    'Flexione os cotovelos e suba a barra até a altura do peito.',
    'Desça devagar até estender os braços.',
    'Mantenha os cotovelos junto ao tronco, sem balançar o corpo.',
  ]),
  ex('rosca-alternada', 'Rosca alternada com halteres', 'Bíceps', 'Halteres', [
    'Em pé, um halter em cada mão, braços estendidos ao lado do corpo.',
    'Flexione um cotovelo e suba o halter até o ombro, girando a palma para cima.',
    'Desça devagar e repita com o outro braço.',
    'Mantenha os cotovelos junto ao tronco, sem balançar o corpo.',
  ]),
  ex('rosca-martelo', 'Rosca martelo', 'Bíceps', 'Halteres', [
    'Em pé, um halter em cada mão, palmas voltadas para o corpo.',
    'Flexione os cotovelos e suba os halteres sem girar os punhos.',
    'Desça com controle até estender os braços.',
    'Mantenha os cotovelos parados ao lado do tronco.',
  ]),
  ex('rosca-scott', 'Rosca Scott', 'Bíceps', 'Máquina', [
    'Sente na máquina e apoie a parte de trás dos braços no encosto.',
    'Segure as alças e flexione os cotovelos até contrair os bíceps.',
    'Desça devagar, sem estender totalmente os cotovelos.',
    'Não tire os braços do apoio.',
  ]),

  // Tríceps
  ex('triceps-polia', 'Tríceps na polia com corda', 'Tríceps', 'Polia', [
    'De frente para a polia alta, segure a barra ou a corda com os cotovelos junto ao tronco.',
    'Estenda os cotovelos, empurrando para baixo até os braços ficarem retos.',
    'Volte devagar até os antebraços passarem um pouco da horizontal.',
    'Mexa só os antebraços; os cotovelos ficam parados.',
  ]),
  ex('triceps-testa', 'Tríceps testa', 'Tríceps', 'Barra W', [
    'Deite no banco e segure a barra W acima do peito, braços estendidos.',
    'Flexione os cotovelos e desça a barra em direção à testa.',
    'Estenda os cotovelos para voltar à posição inicial.',
    'Mantenha os cotovelos apontados para cima, sem abrir.',
  ]),
  ex('triceps-frances', 'Tríceps francês com halter', 'Tríceps', 'Halter', [
    'Sentado ou em pé, segure um halter com as duas mãos acima da cabeça.',
    'Flexione os cotovelos e desça o halter atrás da cabeça.',
    'Estenda os cotovelos até o halter voltar ao alto.',
    'Mantenha os cotovelos próximos da cabeça.',
  ]),
  ex('mergulho', 'Mergulho nas paralelas', 'Tríceps', 'Peso corporal', [
    'Apoie as mãos nas barras e sustente o corpo com os braços estendidos.',
    'Desça flexionando os cotovelos até cerca de 90°.',
    'Empurre para cima até estender os braços.',
    'Mantenha o tronco mais ereto para dar ênfase ao tríceps.',
  ]),

  // Quadríceps e glúteos
  ex('agachamento-livre', 'Agachamento livre com barra', 'Quadríceps', 'Barra', [
    'Apoie a barra na parte de cima das costas, pés na largura dos ombros.',
    'Desça levando o quadril para trás e flexionando os joelhos, com o peito aberto.',
    'Vá até as coxas ficarem paralelas ao chão, ou até onde conseguir manter a postura.',
    'Suba empurrando o chão, com os joelhos alinhados aos pés.',
  ]),
  ex('leg-press', 'Leg press 45°', 'Quadríceps', 'Máquina', [
    'Sente no aparelho com as costas bem apoiadas e os pés na plataforma, na largura dos ombros.',
    'Destrave e desça a plataforma flexionando os joelhos até cerca de 90°.',
    'Empurre de volta sem travar os joelhos no final.',
    'Não deixe o quadril descolar do assento.',
  ]),
  ex('cadeira-extensora', 'Cadeira extensora', 'Quadríceps', 'Máquina', [
    'Sente com as costas apoiadas e o rolo ajustado sobre os tornozelos.',
    'Estenda os joelhos até as pernas ficarem quase retas.',
    'Segure um instante e desça devagar.',
    'Alinhe os joelhos com o eixo da máquina.',
  ]),
  ex('afundo', 'Afundo com halteres', 'Glúteos', 'Halteres', [
    'Em pé, um halter em cada mão, dê um passo largo à frente.',
    'Desça até os dois joelhos formarem cerca de 90°.',
    'Empurre o chão com a perna da frente para voltar.',
    'Alterne as pernas, com o tronco ereto.',
  ]),
  ex('agachamento-bulgaro', 'Agachamento búlgaro', 'Glúteos', 'Halteres', [
    'De costas para um banco, apoie o peito de um pé sobre ele e segure os halteres.',
    'Desça flexionando o joelho da frente até a coxa ficar paralela ao chão.',
    'Suba empurrando o chão com o pé da frente.',
    'Complete as repetições e troque de perna.',
  ]),
  ex('elevacao-pelvica', 'Elevação pélvica com barra', 'Glúteos', 'Barra', [
    'Apoie a parte de cima das costas em um banco, com a barra sobre o quadril.',
    'Com os pés firmes no chão, eleve o quadril até alinhar tronco e coxas.',
    'Contraia os glúteos no alto por um instante.',
    'Desça com controle, sem encostar no chão.',
  ]),

  // Posteriores e panturrilha
  ex('stiff', 'Stiff com barra', 'Posteriores', 'Barra', [
    'Em pé, segure a barra à frente das coxas, joelhos levemente flexionados.',
    'Leve o quadril para trás e desça a barra rente às pernas, com a coluna reta.',
    'Desça até sentir alongar a parte de trás das coxas.',
    'Suba contraindo glúteos e posteriores.',
  ]),
  ex('mesa-flexora', 'Mesa flexora', 'Posteriores', 'Máquina', [
    'Deite de bruços com o rolo apoiado logo acima dos calcanhares.',
    'Flexione os joelhos, trazendo o rolo em direção aos glúteos.',
    'Desça devagar até quase estender as pernas.',
    'Mantenha o quadril encostado no aparelho.',
  ]),
  ex('cadeira-flexora', 'Cadeira flexora', 'Posteriores', 'Máquina', [
    'Sente com as costas apoiadas e o rolo ajustado atrás dos tornozelos.',
    'Flexione os joelhos, puxando o rolo para baixo e para trás.',
    'Volte devagar até quase estender as pernas.',
    'Use o apoio das coxas para não levantar do assento.',
  ]),
  ex('panturrilha-em-pe', 'Panturrilha em pé', 'Panturrilha', 'Máquina', [
    'Posicione os ombros sob os apoios e a ponta dos pés na plataforma.',
    'Suba o máximo que conseguir na ponta dos pés.',
    'Segure um instante no alto.',
    'Desça devagar até alongar bem a panturrilha.',
  ]),
  ex('panturrilha-sentado', 'Panturrilha sentado', 'Panturrilha', 'Máquina', [
    'Sente com os joelhos sob o apoio e a ponta dos pés na plataforma.',
    'Eleve os calcanhares o máximo que conseguir.',
    'Segure um instante no alto.',
    'Desça devagar até alongar a panturrilha.',
  ]),

  // Abdômen
  ex('prancha', 'Prancha', 'Abdômen', 'Peso corporal', [
    'Apoie os antebraços e a ponta dos pés no chão.',
    'Mantenha o corpo em linha reta, com abdômen e glúteos contraídos.',
    'Sustente a posição pelo tempo previsto, respirando normalmente.',
    'Não deixe o quadril cair nem subir demais.',
  ]),
  ex('abdominal-supra', 'Abdominal supra', 'Abdômen', 'Peso corporal', [
    'Deite de costas com os joelhos flexionados e os pés no chão.',
    'Com as mãos ao lado da cabeça, tire os ombros do chão contraindo o abdômen.',
    'Desça devagar, sem relaxar totalmente.',
    'Não puxe o pescoço com as mãos.',
  ]),
  ex('elevacao-pernas', 'Elevação de pernas na barra', 'Abdômen', 'Barra fixa', [
    'Pendure-se na barra fixa com os braços estendidos.',
    'Eleve as pernas até a altura do quadril, ou os joelhos em direção ao peito.',
    'Desça devagar, sem balançar.',
    'Mantenha o abdômen contraído durante todo o movimento.',
  ]),
  ex('abdominal-polia', 'Abdominal na polia', 'Abdômen', 'Polia', [
    'Ajoelhe de frente para a polia alta e segure a corda ao lado da cabeça.',
    'Flexione o tronco, levando os cotovelos em direção aos joelhos.',
    'Volte devagar até o tronco ficar ereto.',
    'O movimento vem do abdômen, não dos braços nem do quadril.',
  ]),
  // Acrescentados na lista de 50
  ex('peck-deck', 'Peck deck', 'Peito', 'Máquina', [
    'Sente com as costas apoiadas e ajuste o banco para as alças ficarem na altura do peito.',
    'Com os cotovelos levemente flexionados, feche os braços à frente até as mãos quase se tocarem.',
    'Segure um instante contraindo o peito.',
    'Volte devagar, sem deixar os pesos baterem.',
  ]),
  ex('pulldown', 'Pulldown com braços estendidos', 'Costas', 'Polia', [
    'De frente para a polia alta, segure a barra com os braços estendidos e o tronco levemente inclinado.',
    'Puxe a barra em arco até as coxas, sem dobrar os cotovelos.',
    'Segure um instante contraindo as costas.',
    'Volte devagar até a barra ficar na altura dos ombros.',
  ]),
  ex('encolhimento', 'Encolhimento de ombros com halteres', 'Ombros', 'Halteres', [
    'Em pé, um halter em cada mão ao lado do corpo, braços estendidos.',
    'Eleve os ombros em direção às orelhas, o mais alto que conseguir.',
    'Segure um instante no alto.',
    'Desça devagar, sem girar os ombros nem dobrar os cotovelos.',
  ]),
  ex('rosca-concentrada', 'Rosca concentrada', 'Bíceps', 'Halter', [
    'Sente no banco com as pernas afastadas e apoie o cotovelo na parte interna da coxa.',
    'Com o braço estendido, flexione o cotovelo e suba o halter até o ombro.',
    'Segure um instante contraindo o bíceps.',
    'Desça devagar, complete as repetições e troque de braço.',
  ]),
  ex('mergulho-banco', 'Mergulho no banco', 'Tríceps', 'Peso corporal', [
    'De costas para um banco, apoie as mãos na borda, ao lado do quadril, e estenda as pernas à frente.',
    'Desça o corpo flexionando os cotovelos até cerca de 90°.',
    'Empurre o banco para subir até estender os braços.',
    'Mantenha as costas perto do banco e os cotovelos apontados para trás.',
  ]),
  ex('agachamento-hack', 'Agachamento hack', 'Quadríceps', 'Máquina', [
    'Apoie as costas e os ombros no aparelho, com os pés na plataforma na largura dos ombros.',
    'Destrave e desça flexionando os joelhos até as coxas ficarem paralelas à plataforma.',
    'Empurre a plataforma para subir, sem travar os joelhos no final.',
    'Mantenha as costas apoiadas e os joelhos alinhados aos pés.',
  ]),
  ex('cadeira-abdutora', 'Cadeira abdutora', 'Glúteos', 'Máquina', [
    'Sente com as costas apoiadas e a parte de fora das coxas nos apoios.',
    'Afaste as pernas o máximo que conseguir.',
    'Segure um instante contraindo os glúteos.',
    'Volte devagar, sem deixar os pesos baterem.',
  ]),
  ex('cadeira-adutora', 'Cadeira adutora', 'Adutores', 'Máquina', [
    'Sente com as costas apoiadas e a parte de dentro das coxas nos apoios, pernas afastadas.',
    'Feche as pernas até os apoios se encontrarem.',
    'Segure um instante.',
    'Volte devagar até a abertura inicial.',
  ]),
  ex('abdominal-infra', 'Abdominal infra no solo', 'Abdômen', 'Peso corporal', [
    'Deite de costas com as mãos ao lado do corpo e as pernas estendidas.',
    'Eleve as pernas juntas até ficarem na vertical.',
    'Desça devagar, sem encostar os pés no chão.',
    'Mantenha a lombar colada no chão durante todo o movimento.',
  ]),
  ex('abdominal-obliquo', 'Abdominal oblíquo (bicicleta)', 'Abdômen', 'Peso corporal', [
    'Deite de costas com as mãos ao lado da cabeça e as pernas elevadas.',
    'Leve um cotovelo em direção ao joelho oposto enquanto estende a outra perna.',
    'Alterne os lados, como se pedalasse.',
    'Gire o tronco, sem puxar o pescoço com as mãos.',
  ]),
  ex('extensao-lombar', 'Extensão lombar no banco', 'Lombar', 'Banco romano', [
    'Ajuste o banco para o apoio ficar logo abaixo do quadril e prenda os calcanhares.',
    'Com as mãos cruzadas no peito, desça o tronco à frente com a coluna reta.',
    'Suba até o tronco alinhar com as pernas, sem passar desse ponto.',
    'Faça o movimento devagar, sem impulso.',
  ]),
]

/** Ordem do catálogo (a da lista de 50 exercícios). */
const ORDER = [
  'supino-reto',
  'supino-inclinado',
  'crucifixo',
  'crossover',
  'flexao',
  'peck-deck',
  'puxada-frontal',
  'barra-fixa',
  'remada-curvada',
  'remada-unilateral',
  'remada-baixa',
  'pulldown',
  'levantamento-terra',
  'desenvolvimento-halteres',
  'desenvolvimento-militar',
  'elevacao-lateral',
  'elevacao-frontal',
  'crucifixo-inverso',
  'encolhimento',
  'rosca-direta',
  'rosca-alternada',
  'rosca-martelo',
  'rosca-scott',
  'rosca-concentrada',
  'triceps-polia',
  'triceps-testa',
  'triceps-frances',
  'mergulho-banco',
  'mergulho',
  'agachamento-livre',
  'leg-press',
  'cadeira-extensora',
  'afundo',
  'agachamento-bulgaro',
  'agachamento-hack',
  'elevacao-pelvica',
  'cadeira-abdutora',
  'cadeira-adutora',
  'mesa-flexora',
  'cadeira-flexora',
  'stiff',
  'panturrilha-em-pe',
  'panturrilha-sentado',
  'abdominal-supra',
  'elevacao-pernas',
  'abdominal-infra',
  'prancha',
  'abdominal-obliquo',
  'abdominal-polia',
  'extensao-lombar',
]
EXERCISES.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id))

/** Nomes do catálogo local por id, para reconhecer arquivos de mídia mesmo se o banco tiver nomes antigos. */
export const LOCAL_NAMES: Record<string, string> = Object.fromEntries(EXERCISES.map((e) => [e.id, e.name]))

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]))

/** Troca o catálogo pelo que veio do banco (antes de as telas renderizarem). */
export function setExercises(list: Exercise[]) {
  if (!list.length) return
  const order = new Map(ORDER.map((id, i) => [id, i]))
  const sorted = [...list].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
  EXERCISES.splice(0, EXERCISES.length, ...sorted)
  for (const k of Object.keys(EXERCISE_BY_ID)) delete EXERCISE_BY_ID[k]
  for (const e of sorted) EXERCISE_BY_ID[e.id] = e
}

/** Seções da Biblioteca, na ordem do design. */
export const LIBRARY_SECTIONS: { name: string; groups: string[] }[] = [
  { name: 'Peito', groups: ['Peito'] },
  { name: 'Costas', groups: ['Costas'] },
  { name: 'Ombros', groups: ['Ombros'] },
  { name: 'Bíceps', groups: ['Bíceps'] },
  { name: 'Tríceps', groups: ['Tríceps'] },
  { name: 'Quadríceps e glúteos', groups: ['Quadríceps', 'Glúteos', 'Adutores'] },
  { name: 'Posteriores e panturrilhas', groups: ['Posteriores', 'Panturrilha'] },
  { name: 'Abdômen e core', groups: ['Abdômen', 'Lombar'] },
]
