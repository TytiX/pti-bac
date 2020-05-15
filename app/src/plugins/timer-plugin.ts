import _Vue from 'vue';

export default function VueTimerPlugin(Vue: typeof _Vue): void {

  Vue.filter('timer', (value: number) => {
    const rem = value / 1000; // secs
    const min = Math.trunc(rem / 60);
    const sec = rem % 60;
    const minBuffer = min > 0 ? `${min}min ` : ''
    return minBuffer + `${sec}s`
  });
}
