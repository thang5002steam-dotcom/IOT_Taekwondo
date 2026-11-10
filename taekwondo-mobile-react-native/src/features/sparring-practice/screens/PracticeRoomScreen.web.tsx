import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { ThemedText } from '@/shared/ui/ThemedText';
import { Colors, radii } from '@/theme';
import { practiceApi } from '../data/practiceApi';
import { usePracticeRoom } from '../hooks/usePracticeRoom';

function PracticeVideo({ source, status, mediaOffsetMs, onFinished }: { source: string; status: string; mediaOffsetMs: number; onFinished: () => void }) {
  const player = useVideoPlayer(source, p => { p.loop = false; });

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      player.pause();
      onFinished();
    });
    return () => subscription.remove();
  }, [onFinished, player]);

  useEffect(() => {
    if (status === 'RUNNING') {
      // expo-video exposes playback position through an imperative controller.
      // eslint-disable-next-line react-hooks/immutability
      player.currentTime = mediaOffsetMs / 1000;
      player.play();
      return;
    }
    player.pause();
    player.currentTime = mediaOffsetMs / 1000;
  }, [mediaOffsetMs, player, status]);

  return <VideoView player={player} style={StyleSheet.absoluteFill} nativeControls contentFit="contain" />;
}

export function PracticeRoomScreen() {
  const { roomCode: raw } = useLocalSearchParams<{ roomCode: string }>(); const roomCode=Array.isArray(raw)?raw[0]:raw??'';
  const { snapshot, operator, error, send }=usePracticeRoom(roomCode, 'operator'); const [uploading,setUploading]=useState(false); const [uploadError,setUploadError]=useState<string|null>(null);
  const finishVideo = useCallback(() => { if (operator && snapshot.status === 'RUNNING') send({ type: 'videoEnded' }); }, [operator, send, snapshot.status]);
  const upload=async()=>{ const input=document.createElement('input'); input.type='file'; input.accept='video/mp4'; input.onchange=async()=>{ const file=input.files?.[0]; const probe=document.createElement('video'); if(!file)return; if(file.type!=='video/mp4'||!probe.canPlayType(file.type)||file.size>524_288_000){setUploadError('Chỉ nhận video MP4 có thể phát trên trình duyệt, tối đa 500 MB.');return;} setUploading(true);setUploadError(null); try { const grant=await practiceApi.uploadUrl(roomCode); const response=await fetch(grant.uploadUrl,{method:'PUT',headers:{'content-type':'video/mp4'},body:file}); if(!response.ok)throw new Error('storage-upload-failed'); await practiceApi.uploadComplete(roomCode,grant.objectPath); } catch { setUploadError('Không thể tải video. Kiểm tra bucket Supabase private "sparring-practice-videos" và cấu hình backend.'); } finally { setUploading(false); } }; input.click(); };
  const countdown = snapshot.status==='COUNTDOWN' ? 'Đang đếm 3 · 2 · 1' : snapshot.status;
  return <View style={styles.page}><View style={styles.header}><ThemedText style={styles.title}>TẬP LÀM TRỌNG TÀI · PHÒNG {roomCode}</ThemedText><ThemedText style={styles.status}>{countdown}</ThemedText></View>
    <View style={styles.content}><View style={styles.video}>{snapshot.videoUrl?<PracticeVideo source={snapshot.videoUrl} status={snapshot.status} mediaOffsetMs={snapshot.mediaOffsetMs} onFinished={finishVideo}/>:<ThemedText>Chưa có video</ThemedText>}</View><View style={styles.panel}>
      <ThemedText type="subtitle">Điểm: Đỏ {snapshot.redScore} — {snapshot.blueScore} Xanh</ThemedText><ThemedText>Đồng thuận {snapshot.consensusJudges}/{snapshot.maximumJudges} · cửa sổ {snapshot.scoringWindowSeconds}s</ThemedText>
      <View style={styles.judges}>{snapshot.judges.map(j=><View key={j.position} style={[styles.judge,j.connected?styles.online:styles.offline]}><ThemedText>Giám định {j.position}: {j.connected?(j.ready?'Sẵn sàng':'Đang chờ'):'Mất kết nối'}</ThemedText></View>)}</View>
      {operator?<><Pressable onPress={()=>void upload()} disabled={uploading||snapshot.videoUploaded} style={styles.action}><ThemedText>{uploading?'Đang tải video…':snapshot.videoUploaded?'Video đã sẵn sàng':'Tải video MP4'}</ThemedText></Pressable><Pressable disabled={!snapshot.canStart} onPress={()=>send({type:snapshot.status==='PAUSED'?'resume':'start'})} style={[styles.start,!snapshot.canStart&&styles.disabled]}><ThemedText style={styles.startText}>{snapshot.status==='PAUSED'?'TIẾP TỤC':'BẮT ĐẦU'}</ThemedText></Pressable><Pressable onPress={()=>send({type:'reset'})} style={styles.action}><ThemedText>Đặt lại kết quả</ThemedText></Pressable></>:null}
      {error?<ThemedText style={styles.error}>{error}</ThemedText>:null}{uploadError?<ThemedText style={styles.error}>{uploadError}</ThemedText>:null}
    </View></View></View>;
}
const styles=StyleSheet.create({page:{flex:1,backgroundColor:Colors.light.background},header:{height:64,backgroundColor:'#A21D22',paddingHorizontal:24,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},title:{color:'#fff',fontWeight:'800',fontSize:20},status:{color:'#fff'},content:{flex:1,flexDirection:'row',padding:24,gap:24},video:{flex:2,backgroundColor:'#111',alignItems:'center',justifyContent:'center'},panel:{flex:1,gap:14},judges:{gap:8},judge:{padding:10,borderRadius:radii.md},online:{backgroundColor:'#DDF6E7'},offline:{backgroundColor:'#F8D7DA'},action:{padding:14,borderRadius:radii.md,backgroundColor:'#E6E6E6',alignItems:'center'},start:{padding:16,borderRadius:radii.md,backgroundColor:Colors.light.success,alignItems:'center'},disabled:{opacity:.4},startText:{color:'#fff',fontWeight:'900'},error:{color:Colors.light.primary}});
