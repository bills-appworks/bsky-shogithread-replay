import { KifuLite, KifuStore } from 'kifu-for-js';

const KifuForJS = ({replayState}) => {
  return (<KifuLite kifuStore={replayState.kifuStore} />);
}

export default KifuForJS;
