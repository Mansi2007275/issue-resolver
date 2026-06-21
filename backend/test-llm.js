import { loadModel, unloadModel, completion, LLAMA_3_2_1B_INST_Q4_0 } from '@qvac/sdk';

async function test() {
  console.log('Loading LLaMA model...');
  try {
    const modelId = await loadModel({
      modelSrc: LLAMA_3_2_1B_INST_Q4_0
    });
    console.log('Loaded:', modelId);
    
    console.log('Running completion...');
    const result = completion({
      modelId,
      history: [
        { role: 'system', content: 'You are an AI assistant.' },
        { role: 'user', content: 'Say hello world.' }
      ]
    });
    
    for await (const e of result.events) {
      if (e.type === 'contentDelta') process.stdout.write(e.text);
    }
    
    console.log('\nFinal:', (await result.final).text);
    
    await unloadModel({ modelId });
  } catch(err) {
    console.error('Error:', err);
  }
}
test();
