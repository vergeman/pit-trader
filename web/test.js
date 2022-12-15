console.log("Hello from js");

async function load() {
    try {
        const session = await ort.InferenceSession.create('./onnx_model.onnx');
        return session;
    } catch(e) {}
};

function argMax(array) {
    return [].reduce.call(array, (m, c, i, arr) => c > arr[m] ? i : m, 0);
}

function softmax(arr) {
    return arr.map(function(value,index) {
        return Math.exp(value) / arr.map( function(y /*value*/){ return Math.exp(y) } ).reduce( function(a,b){ return a+b });
    });
}
// use an async context to call onnxruntime functions.
async function main(session, i) {

    try {
        // create a new session and load the specific model.
        //
        // the model in this example contains a single MatMul node
        // it has 2 inputs: 'a'(float32, 3x4) and 'b'(float32, 4x3)
        // it has 1 output: 'c'(float32, 3x3)
        //const session = await ort.InferenceSession.create('./onnx_model.onnx');
        //const session = await ort.InferenceSession.create('./model.onnx');

        //const inputTensor = new Tensor("float32", float32Data, dims);
        //const input = new onnx.Tensor(new Float32Array(280 * 280 * 4), 'float32', [280 * 280 * 4]);
        //const outputMap = await sess.run([input]);
        //const outputTensor = outputMap.values().next().value;
        //console.log(`Output tensor: ${outputTensor.data}`);

        // prepare inputs. a tensor need its corresponding TypedArray as data


        //1
        const dataA= Float32Array.from([-0.23843570053577423,0.5557488799095154,8.099923398674491e-09,-0.2901952266693115,0.46632587909698486,0.038187917321920395,-0.2908370941877365,0.37634003162384033,0.03960394114255905,-0.24904298782348633,0.3229396343231201,0.03340559080243111,-0.2121058702468872,0.3068896532058716,0.03009727969765663,-0.2973580062389374,0.3259153366088867,-0.0005952746723778546,-0.30075764656066895,0.2242145538330078,-0.0076938895508646965,-0.3015928566455841,0.15848565101623535,-0.011754637584090233,-0.29940126836299896,0.10876128077507019,-0.016037218272686005,-0.24925796687602997,0.3274097442626953,-0.024795468896627426,-0.21915209293365479,0.21040332317352295,-0.032224707305431366,-0.19336026906967163,0.1420646607875824,-0.031165294349193573,-0.17103782296180725,0.0925619900226593,-0.032828815281391144,-0.20255491137504578,0.34611058235168457,-0.04239831492304802,-0.1702820360660553,0.28911203145980835,-0.025722267106175423,-0.17848533391952515,0.32128793001174927,0.0044182902202010155,-0.19032025337219238,0.35539770126342773,0.02066822536289692,-0.16041401028633118,0.37744128704071045,-0.060741618275642395,-0.14658570289611816,0.33384251594543457,-0.03550593554973602,-0.15451866388320923,0.3598613142967224,-0.0101359523832798,-0.1638956367969513,0.38808149099349976,0.00533741619437933,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-0.06351196765899658,-0.09440232813358307,0.06212702393531799,-0.08918215334415436,0.0,0.0,-0.0026901662349700928,0.07630330324172974,-0.13774454593658447,-0.06558357179164886,0.12554755806922913,-0.0572899729013443]);

        //2
        const dataB = Float32Array.from([0.3176526427268982,0.4449482560157776,-2.415009303646798e-09,0.3595370650291443,0.37668925523757935,0.0069511812180280685,0.3821637034416199,0.30224138498306274,0.0039483606815338135,0.37460148334503174,0.2480984330177307,0.0008262111223302782,0.35005319118499756,0.22908347845077515,-0.0007199117681011558,0.3530671000480652,0.24380987882614136,-0.033461794257164,0.353710412979126,0.19651445746421814,-0.04352659732103348,0.34935879707336426,0.22358667850494385,-0.03928663581609726,0.3424454927444458,0.24527448415756226,-0.03944289684295654,0.3183901309967041,0.23831087350845337,-0.048068005591630936,0.31992876529693604,0.1391690969467163,-0.07223691046237946,0.321114182472229,0.07199078798294067,-0.08446309715509415,0.3215477466583252,0.010687053203582764,-0.09598296880722046,0.2825170159339905,0.25584936141967773,-0.058835335075855255,0.27571332454681396,0.161590576171875,-0.07946838438510895,0.2730368375778198,0.10302010178565979,-0.09031771868467331,0.27088063955307007,0.050014883279800415,-0.09857895970344543,0.2466002106666565,0.29034388065338135,-0.0677228569984436,0.22732776403427124,0.22686117887496948,-0.08170898258686066,0.21337890625,0.18778669834136963,-0.08955962210893631,0.20037096738815308,0.14780694246292114,-0.0970650017261502,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-0.04381898045539856,-0.0862945169210434,0.05565363168716431,-0.07816900312900543,0.0,0.0,0.0010820627212524414,0.06132000684738159,-0.09138694405555725,-0.07271541655063629,0.12479913234710693,-0.06143324077129364]);

        const tensorA = new ort.Tensor('float32', dataA, [138]);
        const tensorB = new ort.Tensor('float32', dataB, [138]);

        // feed inputs and run
        // seems to work logits match
        const results = await session.run({'landmarks': tensorB});
        const output = results.class.data;
        const probs = softmax(output);
        console.log("O", output);
        console.log("P", probs);


        //console.log(session)
        // read from results
        /*
        document.write(`data of result tensor ${i}: ${JSON.stringify(results)} <br/>`);
        document.write(`data of softmax ${i}: ${JSON.stringify(probs)} <br/>`);
        document.write(`class: ${argMax(probs)}  <br/>`);
*/

    } catch (e) {
        document.write(`failed to inference ONNX model: ${e}.`);
    }
    i++;
}

load().then( (session) => {


    let i = 0;

    //how intensive is onnx?

    /*
    setInterval( () => {
        main(session, i);
        i++;
    }, 250);
    */

    main(session, i);
}).catch( (e) => {
    document.write(`failed to inference ONNX model: ${e}.`);
});
