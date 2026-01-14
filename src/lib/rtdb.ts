
// Por exemplo, em um componente React, um script Vue, ou um arquivo JavaScript puro

import { database } from '@/firebase'; // Ajuste o caminho conforme onde você salvou o arquivo
import { ref, set, onValue, push, remove } from 'firebase/database'; // Importe as funções necessárias

// --- Funções para interagir com o banco de dados ---

// Função para adicionar um novo professor
export function adicionarProfessor(idProfessor: string, nome: string, materia: string) {
  set(ref(database, `professores/${idProfessor}`), {
    nome: nome,
    materia: materia,
    cadastro: new Date().toISOString()
  })
  .then(() => {
    console.log(`Professor ${nome} adicionado com sucesso!`);
  })
  .catch((error) => {
    console.error("Erro ao adicionar professor:", error);
  });
}

// Função para ouvir mudanças na lista de alunos (exemplo mais dinâmico)
export function monitorarAlunos() {
  const alunosRef = ref(database, 'alunos');

  // onValue é uma função que escuta em tempo real.
  // Sempre que os dados em 'alunos' mudarem, esta função de callback será executada.
  const unsubscribe = onValue(alunosRef, (snapshot) => {
    const dadosAlunos = snapshot.val(); // Pega os dados como um objeto JavaScript
    console.log("Dados de alunos atualizados:", dadosAlunos);

    if (dadosAlunos) {
      // Se houver alunos, você pode iterar sobre eles
      Object.keys(dadosAlunos).forEach(alunoId => {
        console.log(`Aluno ID: ${alunoId}, Nome: ${dadosAlunos[alunoId].nome}, Turma: ${dadosAlunos[alunoId].turma}`);
      });
    } else {
      console.log("Nenhum aluno encontrado.");
    }
  }, {
    // onValue também pode ter um segundo callback para erros
    onlyOnce: false // Mantenha como false para escutar em tempo real. True para ler apenas uma vez.
  });

  return unsubscribe;
}
