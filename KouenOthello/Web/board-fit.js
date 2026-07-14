// 描いた盤（背景画像 imagegen-park-board.png）の透視台形に、
// CSSグリッドの盤（.board-wrap）をmatrix3d射影変換で載せる。
// 台形の四隅は背景画像を実測した「シーンに対する比率」。リサイズで再計算。
(function () {
  // 緑のplaying fieldの四隅（背景画像941x1672を実測 → シーン比率）
  var Q = {
    tl: [0.2030, 0.4420],
    tr: [0.8119, 0.4420],
    bl: [0.1243, 0.7004],
    br: [0.8969, 0.7004]
  };
  // .board-wrap を四隅のバウンディングボックスに合わせる
  var L = Math.min(Q.tl[0], Q.bl[0]);
  var R = Math.max(Q.tr[0], Q.br[0]);
  var T = Math.min(Q.tl[1], Q.tr[1]);
  var B = Math.max(Q.bl[1], Q.br[1]);
  var BW = R - L, BH = B - T;

  function solveHomography(src, dst) {
    // src,dst: [[x,y]*4]。x'=(h0x+h1y+h2)/(h6x+h7y+1), y'=(h3x+h4y+h5)/(...)
    var A = [], b = [];
    for (var i = 0; i < 4; i++) {
      var x = src[i][0], y = src[i][1], X = dst[i][0], Y = dst[i][1];
      A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]); b.push(X);
      A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]); b.push(Y);
    }
    // ガウスの消去法（8x8）
    for (var col = 0; col < 8; col++) {
      var piv = col;
      for (var r = col + 1; r < 8; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
      var tA = A[col]; A[col] = A[piv]; A[piv] = tA;
      var tb = b[col]; b[col] = b[piv]; b[piv] = tb;
      var d = A[col][col];
      for (var c = col; c < 8; c++) A[col][c] /= d;
      b[col] /= d;
      for (var r2 = 0; r2 < 8; r2++) {
        if (r2 === col) continue;
        var f = A[r2][col];
        for (var c2 = col; c2 < 8; c2++) A[r2][c2] -= f * A[col][c2];
        b[r2] -= f * b[col];
      }
    }
    return b; // [h0..h7]
  }

  function apply() {
    var scene = document.querySelector('.scene');
    var wrap = document.querySelector('.board-wrap');
    if (!scene || !wrap) return;
    var sw = scene.clientWidth, sh = scene.clientHeight;
    // .board-wrap をバウンディングボックスに配置
    wrap.style.setProperty('left', (L * 100) + '%', 'important');
    wrap.style.setProperty('top', (T * 100) + '%', 'important');
    wrap.style.setProperty('width', (BW * 100) + '%', 'important');
    wrap.style.setProperty('height', (BH * 100) + '%', 'important');
    wrap.style.setProperty('transform-origin', '0 0', 'important');
    wrap.style.setProperty('perspective', 'none', 'important');

    var Wb = BW * sw, Hb = BH * sh; // board-wrap実寸px
    var src = [[0, 0], [Wb, 0], [0, Hb], [Wb, Hb]];
    // dst: 四隅をboard-wrapローカルpxへ
    function loc(p) { return [(p[0] - L) * sw, (p[1] - T) * sh]; }
    var dst = [loc(Q.tl), loc(Q.tr), loc(Q.bl), loc(Q.br)];
    var h = solveHomography(src, dst);
    var m = 'matrix3d(' +
      h[0] + ',' + h[3] + ',0,' + h[6] + ',' +
      h[1] + ',' + h[4] + ',0,' + h[7] + ',' +
      '0,0,1,0,' +
      h[2] + ',' + h[5] + ',0,1)';
    wrap.style.setProperty('transform', m, 'important');
  }

  function schedule() { requestAnimationFrame(apply); }
  if (document.readyState !== 'loading') schedule();
  else document.addEventListener('DOMContentLoaded', schedule);
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', function () { setTimeout(apply, 250); });
})();
