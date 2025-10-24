import { body, validationResult } from 'express-validator';

export const validateOrderCreation = [
    body('ethAddress')
        .isEthereumAddress()
        .withMessage('Invalid Ethereum address'),
    body('collateralPriceMax')
        .isNumeric()
        .withMessage('Collateral price max must be a number'),
    body('collateralPriceMin')
        .isNumeric()
        .withMessage('Collateral price min must be a number'),
    body('collateralMarketAddress')
        .isEthereumAddress()
        .withMessage('Invalid collateral market address'),
    body('loanTokenMarketAddress')
        .isEthereumAddress()
        .withMessage('Invalid loan token market address'),
];

export const validateOrderUpdate = [
    body('ethAddress')
        .optional()
        .isEthereumAddress()
        .withMessage('Invalid Ethereum address'),
    body('collateralPriceMax')
        .optional()
        .isNumeric()
        .withMessage('Collateral price max must be a number'),
    body('collateralPriceMin')
        .optional()
        .isNumeric()
        .withMessage('Collateral price min must be a number'),
    body('collateralMarketAddress')
        .optional()
        .isEthereumAddress()
        .withMessage('Invalid collateral market address'),
    body('loanTokenMarketAddress')
        .optional()
        .isEthereumAddress()
        .withMessage('Invalid loan token market address'),
];

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};