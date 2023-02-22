import Landmarks from "./Landmarks";
import * as glMatrix from "gl-matrix";
glMatrix.glMatrix.ARRAY_TYPE = Float64Array;

describe("Walthrough to ensure same conventions between Numpy and Gl-Matrix vector ops", () => {
  const landmark_3_bid = [
    -0.32822541892528534, 0.6529911756515503, -3.0207856216435403e-9,
    -0.3816303610801697, 0.5786553025245667, 0.03739563003182411,
    -0.3971976116299629, 0.5048163533210754, 0.04337593540549278,
    -0.3830052390694618, 0.44977426528930664, 0.04481610283255577,
    -0.35837917029857635, 0.4226379990577698, 0.04838735610246658,
    -0.3842471018433571, 0.45274150371551514, -0.01916174776852131,
    -0.3571983724832535, 0.3631885051727295, -0.01954496279358864,
    -0.3411167412996292, 0.37897294759750366, -0.0033660673070698977,
    -0.3320010304450989, 0.405963659286499, 0.005736192222684622,
    -0.34043581783771515, 0.4478965401649475, -0.04135492071509361,
    -0.327867716550827, 0.3240504264831543, -0.0536247119307518,
    -0.3188679367303848, 0.25801199674606323, -0.046566203236579895,
    -0.31208716332912445, 0.2024666666984558, -0.04408438876271248,
    -0.2978738844394684, 0.4594784379005432, -0.05562121421098709,
    -0.2753143012523651, 0.35131514072418213, -0.06096050888299942,
    -0.26278163492679596, 0.2974083423614502, -0.04979897662997246,
    -0.25752852857112885, 0.2496994137763977, -0.04343279078602791,
    -0.2573185861110687, 0.4845959544181824, -0.06588306277990341,
    -0.225734144449234, 0.41420280933380127, -0.06590458750724792,
    -0.20058795809745789, 0.3784538507461548, -0.057456303387880325,
    -0.1841147243976593, 0.3430398106575012, -0.052435941994190216, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -0.06221345067024231, -0.06595815718173981, 0.03832113742828369,
    -0.06670217216014862, 0.0, 0.0, -0.003713756799697876, 0.07006978988647461,
    -0.1355564296245575, -0.02454233169555664, 0.08062106370925903,
    -0.028070807456970215, 0, -1, 0, 0, 1, 1, 1, -1, -1, -1, -1, -1,
  ];

  const pt0 = glMatrix.vec3.fromValues(...landmark_3_bid.slice(0, 3));
  const pt5 = glMatrix.vec3.fromValues(...landmark_3_bid.slice(15, 18));
  const pt17 = glMatrix.vec3.fromValues(...landmark_3_bid.slice(51, 54));

  const clip = (x, min, max) => {
    if (x < min) return min;
    if (x > max) return max;
    return x;
  };

  //subtract
  it("subtracts", () => {
    const u = glMatrix.vec3.create();
    const v = glMatrix.vec3.create();

    //numpy:
    //u = np.subtract(pt17, pt0)
    //v = np.subtract(pt17, pt5)
    glMatrix.vec3.subtract(u, pt17, pt0);
    glMatrix.vec3.subtract(v, pt17, pt5);

    //these are plucked from parallel numpy results
    expect(u).toStrictEqual(
      new Float64Array([
        0.07090683281421661, -0.16839522123336792, -0.06588305975911779,
      ])
    );
    expect(v).toStrictEqual(
      new Float64Array([
        0.12692851573228836, 0.031854450702667236, -0.0467213150113821,
      ])
    );
  });

  it("calculates cross-product", () => {
    const u = glMatrix.vec3.create();
    const v = glMatrix.vec3.create();

    glMatrix.vec3.subtract(u, pt17, pt0);
    glMatrix.vec3.subtract(v, pt17, pt5);

    //numpy:
    //uv = np.cross(u,v)
    const uv = glMatrix.vec3.create();
    glMatrix.vec3.cross(uv, u, v);

    const np_uv = new Float64Array([
      0.00996631485689326, -0.005049578514754056, 0.02363285369792445,
    ]);
    expect(uv).toStrictEqual(np_uv);
  });

  it("normalizes", () => {
    //NB: for tests set precision to 15, otherwise it's close enough
    //NB2: glMatrix returns applied vector, numpy returns float
    const u = glMatrix.vec3.create();
    const v = glMatrix.vec3.create();

    glMatrix.vec3.subtract(u, pt17, pt0);
    glMatrix.vec3.subtract(v, pt17, pt5);

    const uv = glMatrix.vec3.create();
    glMatrix.vec3.cross(uv, u, v);

    let norm = glMatrix.vec3.create();

    //norm_u = np.linalg.norm(u)  # returns float
    //norm_u_vector = u / norm_u
    //vec3.normalize returns vector
    glMatrix.vec3.normalize(norm, uv);
    norm = norm.map((x) => x.toPrecision(15));

    const np_norm_uv = new Float64Array(
      [0.3812562679560218, -0.19316903859950588, 0.9040627083730357].map((x) =>
        x.toPrecision(15)
      )
    );

    expect(norm).toStrictEqual(np_norm_uv);
  });

  it("dot products", () => {
    const u = glMatrix.vec3.create();
    const v = glMatrix.vec3.create();

    glMatrix.vec3.subtract(u, pt17, pt0);
    glMatrix.vec3.subtract(v, pt17, pt5);

    //numpy:
    //np.dot(u, v)
    const dot = glMatrix.vec3.dot(u, v);
    const np_val = 0.006714104959962427;
    expect(dot).toBe(np_val);
  });

  it("clips", () => {
    //np.clip(-1.1, -1, 1)
    expect(clip(-1.1, -1, 1)).toBe(-1);
    expect(clip(1.1, -1, 1)).toBe(1);
    expect(clip(0.543, -1, 1)).toBe(0.543);
  });

  it("arc cosines", () => {
    const u = glMatrix.vec3.create();
    const v = glMatrix.vec3.create();

    glMatrix.vec3.subtract(u, pt17, pt0);
    glMatrix.vec3.subtract(v, pt17, pt5);

    let norm_u_vector = glMatrix.vec3.create();
    let norm_v_vector = glMatrix.vec3.create();
    glMatrix.vec3.normalize(norm_u_vector, u);
    glMatrix.vec3.normalize(norm_v_vector, v);

    //u / np.linalg.norm(u)
    expect(norm_u_vector).toStrictEqual(
      new Float64Array([
        0.36506625922042524, -0.8669885686099339, -0.3392011914461729,
      ])
    );

    //v / np.linalg.norm(v)
    expect(norm_v_vector).toStrictEqual(
      new Float64Array([
        0.9134518499634446, 0.22924326150076335, -0.3362339138975325,
      ])
    );

    let out_u = glMatrix.vec3.create();
    let out_v = glMatrix.vec3.create();

    //NB: dims are preserved here, numpy does not
    glMatrix.vec3.div(out_u, u, norm_u_vector);
    glMatrix.vec3.div(out_v, v, norm_v_vector);
    const norm_dot_uv = glMatrix.vec3.dot(u, v) / out_u.at(0) / out_v.at(0);
    const np_norm_dot_uv = 0.2487701068907652;
    expect(norm_dot_uv).toBe(np_norm_dot_uv);

    //numpy equiv in Math
    //np.arccos(np.clip(norm_dot_uv, -1, 1))
    const acos = Math.acos(clip(np_norm_dot_uv, -1, 1));
    expect(acos).toBe(1.3193860919043725);
  });
});

describe("Derived landmark methods", () => {
  const landmarks_3_bid = [
    -0.32822541892528534, 0.6529911756515503, -3.0207856216435403e-9,
    -0.3816303610801697, 0.5786553025245667, 0.03739563003182411,
    -0.3971976116299629, 0.5048163533210754, 0.04337593540549278,
    -0.3830052390694618, 0.44977426528930664, 0.04481610283255577,
    -0.35837917029857635, 0.4226379990577698, 0.04838735610246658,
    -0.3842471018433571, 0.45274150371551514, -0.01916174776852131,
    -0.3571983724832535, 0.3631885051727295, -0.01954496279358864,
    -0.3411167412996292, 0.37897294759750366, -0.0033660673070698977,
    -0.3320010304450989, 0.405963659286499, 0.005736192222684622,
    -0.34043581783771515, 0.4478965401649475, -0.04135492071509361,
    -0.327867716550827, 0.3240504264831543, -0.0536247119307518,
    -0.3188679367303848, 0.25801199674606323, -0.046566203236579895,
    -0.31208716332912445, 0.2024666666984558, -0.04408438876271248,
    -0.2978738844394684, 0.4594784379005432, -0.05562121421098709,
    -0.2753143012523651, 0.35131514072418213, -0.06096050888299942,
    -0.26278163492679596, 0.2974083423614502, -0.04979897662997246,
    -0.25752852857112885, 0.2496994137763977, -0.04343279078602791,
    -0.2573185861110687, 0.4845959544181824, -0.06588306277990341,
    -0.225734144449234, 0.41420280933380127, -0.06590458750724792,
    -0.20058795809745789, 0.3784538507461548, -0.057456303387880325,
    -0.1841147243976593, 0.3430398106575012, -0.052435941994190216, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -0.06221345067024231, -0.06595815718173981, 0.03832113742828369,
    -0.06670217216014862, 0.0, 0.0, -0.003713756799697876, 0.07006978988647461,
    -0.1355564296245575, -0.02454233169555664, 0.08062106370925903,
    -0.028070807456970215, 0, -1, 0, 0, 1, 1, 1, -1, -1, -1, -1, -1,
  ];

  const landmarks_3_offer = [
    -0.5079560875892639, 0.6913638710975647, -1.4201200215779863e-9,
    -0.4339156150817871, 0.6654253005981445, -0.0523366816341877,
    -0.3695257306098938, 0.6073600649833679, -0.0868457481265068,
    -0.34585022926330566, 0.5426822304725647, -0.11570096760988235,
    -0.3660324215888977, 0.49112236499786377, -0.14104554057121277,
    -0.4089048206806183, 0.4617593288421631, -0.06858998537063599,
    -0.37274813652038574, 0.412813663482666, -0.10028695315122604,
    -0.3599146604537964, 0.45270681381225586, -0.10928356647491455,
    -0.3587968051433563, 0.5035344958305359, -0.11541939526796341,
    -0.45299991965293884, 0.4234634041786194, -0.06760284304618835,
    -0.42865535616874695, 0.31380921602249146, -0.10175015032291412,
    -0.4061736762523651, 0.2473960816860199, -0.12902778387069702,
    -0.3892730176448822, 0.18938368558883667, -0.15229324996471405,
    -0.5014638304710388, 0.4205336570739746, -0.07137704640626907,
    -0.49521711468696594, 0.3081941604614258, -0.10064975172281265,
    -0.4834815412759781, 0.23619580268859863, -0.12769733369350433,
    -0.4729875326156616, 0.1754382848739624, -0.1488971710205078,
    -0.5530748665332794, 0.44589531421661377, -0.0794675350189209,
    -0.5678269267082214, 0.3544454574584961, -0.10131236165761948,
    -0.5736930519342422, 0.29489582777023315, -0.11866862326860428,
    -0.5736481249332428, 0.24138426780700684, -0.1340925693511963, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -0.0692550539970398, -0.06330583989620209, 0.03704804182052612,
    -0.05540399253368378, 0.0, 0.0, -0.009197235107421875, 0.08012086153030396,
    -0.15971004962921143, -0.009322777390480042, 0.06798362731933594,
    0.0015042424201965332, 1, -1, 0, 0, 1, 1, 1, -1, -1, -1, -1, -1,
  ];

  const build = (landmarks_raw) => {
    const landmarks = [];
    //hands
    for (let i = 0; i < 126 / 3; i++) {
      landmarks.push({
        x: landmarks_raw[3 * i],
        y: landmarks_raw[3 * i + 1],
        z: landmarks_raw[3 * i + 2],
      });
    }
    //face
    for (let i = 0; i < 12 / 2; i++) {
      landmarks.push({
        x: landmarks_raw[126 + 2 * i],
        y: landmarks_raw[126 + 2 * i + 1],
      });
    }
    return landmarks;
  };

  it("setPalmOrientations(): 3 Bid is palm behind (not facing) camera", () => {
    const landmarks = build(landmarks_3_bid);
    const l = new Landmarks();
    l.setHandLandmarks("Left", landmarks.slice(0, 21));
    l.setHandLandmarks("Right", landmarks.slice(21, 42));
    l.setFaceLandmarks(landmarks.slice(42, 48));

    l.setPalmOrientations("Left", landmarks);
    expect(l.palmOrientations[0]).toBe(0);
    expect(l.palmOrientations[1]).toBe(-1);
  });

  it("setPalmOrientations(): Offer 3 is palm facing camera", () => {
    const landmarks = build(landmarks_3_offer);
    const l = new Landmarks();
    l.setHandLandmarks("Left", landmarks.slice(0, 21));
    l.setHandLandmarks("Right", landmarks.slice(21, 42));
    l.setFaceLandmarks(landmarks.slice(42, 48));

    l.setPalmOrientations("Left", landmarks);
    expect(l.palmOrientations[0]).toBe(1);
    expect(l.palmOrientations[1]).toBe(-1);
  });

  it("setFingersOpen(): 3 bid has last 3 elements toggled on", () => {
    const landmarks = build(landmarks_3_bid);
    const l = new Landmarks();
    expect(l.fingersOpens.slice(0, 5)).toStrictEqual(new Array(5).fill(-1));
    l.setHandLandmarks("Left", landmarks.slice(0, 21));
    l.setHandLandmarks("Right", landmarks.slice(21, 42));
    l.setFaceLandmarks(landmarks.slice(42, 48));
    l.setPalmOrientations("Left", landmarks.slice(0, 21));

    l.setFingersOpen("Left", l.palmOrientations, landmarks.slice(0, 21));
    expect(l.fingersOpens.slice(0, 5)).toStrictEqual([0, 0, 1, 1, 1]);
  });

  it("setFingersOpen(): offer 3 also has last 3 elements toggled on", () => {
    const landmarks = build(landmarks_3_offer);
    const l = new Landmarks();
    expect(l.fingersOpens.slice(0, 5)).toStrictEqual(new Array(5).fill(-1));
    l.setHandLandmarks("Left", landmarks.slice(0, 21));
    l.setHandLandmarks("Right", landmarks.slice(21, 42));
    l.setFaceLandmarks(landmarks.slice(42, 48));
    l.setPalmOrientations("Left", landmarks.slice(0, 21));

    l.setFingersOpen("Left", l.palmOrientations, landmarks.slice(0, 21));
    expect(l.fingersOpens.slice(0, 5)).toStrictEqual([0, 0, 1, 1, 1]);
    l.resetFingersOpen();
    expect(l.fingersOpens.slice(0, 5)).toStrictEqual(new Array(5).fill(-1));
  });

  it ("get() returns combined landmark components", () => {
    const landmarks = build(landmarks_3_offer);
    const l = new Landmarks();
    const get = l.get();
    expect(get && get.length).toBe(126 + 12 + 2 + 10);
  })
});
