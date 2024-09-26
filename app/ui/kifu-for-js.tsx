import { KifuLite } from 'kifu-for-js';
import { ReplayState } from '@/app/lib/common';

const KifuForJS = ({ replayState }: { replayState: ReplayState }) => {
  return (<KifuLite kifuStore={ replayState.kifuStore } />);
}

export default KifuForJS;
