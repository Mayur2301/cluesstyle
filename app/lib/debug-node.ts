import whyIsNodeRunning from 'why-is-node-running';

setTimeout(() => {
  console.log('Active handles:');
  whyIsNodeRunning();
}, 5000);