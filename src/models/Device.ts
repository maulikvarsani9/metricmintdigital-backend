import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IDevice extends Document {
  userId: mongoose.Types.ObjectId;
  userType: 'user' | 'merchant' | 'admin';
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

// Statics interface
export interface IDeviceModel extends Model<IDevice> {
  deleteUserDevices(
    userId: string,
    userType: string
  ): Promise<mongoose.DeleteResult>;
  findByAccessToken(token: string): Promise<IDevice | null>;
  findByRefreshToken(token: string): Promise<IDevice | null>;
}

const DeviceSchema: Schema<IDevice> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      refPath: 'userType',
    },
    userType: {
      type: String,
      enum: ['user', 'merchant', 'admin'],
      required: [true, 'User type is required'],
    },
    accessToken: {
      type: String,
      required: [true, 'Access token is required'],
    },
    refreshToken: {
      type: String,
      required: [true, 'Refresh token is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
DeviceSchema.index({ userId: 1, userType: 1 });
DeviceSchema.index({ accessToken: 1 });
DeviceSchema.index({ refreshToken: 1 });

// Static method to delete all devices for a user
DeviceSchema.statics.deleteUserDevices = async function (
  userId: string,
  userType: string
) {
  return this.deleteMany({ userId, userType });
};

// Static method to find device by access token
DeviceSchema.statics.findByAccessToken = async function (token: string) {
  return this.findOne({ accessToken: token });
};

// Static method to find device by refresh token
DeviceSchema.statics.findByRefreshToken = async function (token: string) {
  return this.findOne({ refreshToken: token });
};

// Cast schema to IDeviceModel
export const Device = mongoose.model<IDevice, IDeviceModel>(
  'Device',
  DeviceSchema
);

