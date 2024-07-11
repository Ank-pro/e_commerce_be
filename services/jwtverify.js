const jwt = require('jsonwebtoken');


async function adminjwtauth(req, res, next) {
    try {
        
        const BarrierHeader = req.headers['authorization']

        if (typeof BarrierHeader !== 'undefined') {

            const Barrier = BarrierHeader.split(' ')

            const BT = Barrier[1]
            console.log(BT)

            if (!BT) {
                return res.status(401).json({msg: "NO AUTH TOKEN"});
            }

            const verified = jwt.verify(BT,"SECRET_KEY");

            if (! verified) {
                return res.status(401).json({msg: "ERROR AUTH"});
            } else {
                req.info = verified.id;
                next();
            }

        }else{

            return res.status(401).json({msg: "ERROR AUTH"});
        }
    } catch (e) {
        return res.status(200).json({msg: false, err: e.message});
    }

}


module.exports = adminjwtauth
